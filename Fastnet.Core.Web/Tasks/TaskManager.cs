using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Fastnet.Core.Web.Messaging;
using Microsoft.Extensions.DependencyInjection;

namespace Fastnet.Core.Web.Tasks
{
    public class TaskManager : ITaskManager
    {
        //private readonly TaskContext ctx;
        private readonly string connectionString;
        public ILogger<TaskManager> Logger { get; private set; }
        private IServiceProvider serviceProvider { get; set; }
        private IMessageHubManager messageManager { get; set; }
        public TaskManager(IServiceProvider sp, string connectionString)
        {
            this.connectionString = connectionString;
            this.serviceProvider = sp;
            this.Logger = serviceProvider.GetService<ILogger<TaskManager>>();
        }
        public void Initialise()
        {
            using (var ctx = new TaskContext(this.serviceProvider, this.connectionString))
            {
                foreach(var task in ctx.Tasks)
                {
                    task.Status = TaskStatus.NotRunning;
                }
                var oldHistoryDate = DateTime.Now.AddMonths(-3);
                var oldHistory = ctx.TaskHistory.Where(th => th.FinishedAt < oldHistoryDate).ToArray();
                if(oldHistory.Count() > 0)
                {
                    Logger.LogInformation($"{oldHistory.Count()} task history records deleted");
                }
                ctx.TaskHistory.RemoveRange(oldHistory);
                ctx.SaveChanges();
            }
        }
        public async Task<TaskResult> StartAsync<T>(params object[] args) where T : ITask, new()
        {
            var task = new T();
            return await StartAsync(task, args);
            //WebTask webTask = GetTask(task);
            //return await InternalStartAsync(webTask, task, args);
        }
        public async Task<TaskResult> StartAsync(ITask task, params object[] args)// where T : ITask, new()
        {
            //WebTask webTask = GetTask(task);
            return await Start(task, args);
        }
        public void StartAndForget<T>(params object[] args) where T : ITask, new()
        {
            Task.Run(() => { StartAsync<T>(args).ConfigureAwait(false); });
        }
        public void StartAndForget(ITask task, params object[] args)// where T : ITask, new()
        {
            Task.Run(() => { StartAsync(task, args).ConfigureAwait(false); });
        }
        public IEnumerable<TaskHistory> GetHistory(string taskId)
        {
            using (var ctx = new TaskContext(this.serviceProvider, this.connectionString))
            {
                return ctx.TaskHistory.Where(th => String.Compare(th.Task.TaskId, taskId, true) == 0).ToArray();
            }
        }
        public IEnumerable<TaskHistory> GetHistory<T>() where T: ITask
        {
            string id = typeof(T).FullName;
            return GetHistory(id);
        }
        //private async Task<TaskResult> InternalStartAsync(WebTask webTask, ITask task, params object[] args)
        //{
        //    TaskResult result = await Start(webTask, task, args);
        //    if (!result.Success && result.IsRunning)
        //    {
        //        Logger.LogWarning($"Task {webTask.Name} is already running");
        //    }
        //    return result;
        //}

#if SignalR
        public void SendMessage(MessageBase message)
        {
            if (this.messageManager == null)
            {
                this.messageManager = this.serviceProvider.GetService<IMessageHubManager>();
            }
            this.messageManager.SendMessage(message);
        } 
#endif
        private async Task<TaskResult> Start(ITask task, params object[] args)
        {
            TaskResult r = new TaskResult { Success = false };
            using (var ctx = new TaskContext(this.serviceProvider, this.connectionString))
            {
                WebTask webTask = GetTask(ctx, task);
                bool canExecute = webTask.Status != TaskStatus.Running;
                if (canExecute)
                {
                    try
                    {
                        webTask.Status = TaskStatus.Running;
                        webTask.StartedAt = DateTime.Now;
                        webTask.FinishedAt = DateTime.MinValue;
                        ctx.SaveChanges();
#if SignalR
                    SendMessage(new taskStarted(webTask.Name, webTask.StartedAt.Value)); 
#endif
                        Type generic = typeof(ILogger<>);
                        Type lt = generic.MakeGenericType(task.GetType());
                        var taskLogger = serviceProvider.GetService(lt) as ILogger;
                        r = await task.Execute(taskLogger, args);
                        //return r;
                    }
                    catch (Exception xe)
                    {
                        webTask.CompletionRemark = $"failed: {xe.Message}";
                        webTask.Status = TaskStatus.Failed;
                        r.Exception = xe;
                        this.Logger.LogError($"Task {webTask.Name} failed: {xe.Message}");
                    }
                    finally
                    {
                        webTask.Status = TaskStatus.NotRunning;
                        webTask.FinishedAt = DateTime.Now;// DateTime.UtcNow
                        webTask.CompletionRemark = r.CompletionRemark;// "some message";
                        AddHistory(ctx, webTask);
                        ctx.SaveChanges();
                        //onComplete?.Invoke(r);
#if SignalR
                    SendMessage(new taskFinished(webTask.Name, webTask.FinishedAt.Value, webTask.CompletionRemark)); 
#endif
                    }
                }
                else
                {
                    r.IsRunning = true;
                }
                if (!r.Success && r.IsRunning)
                {
                    Logger.LogWarning($"Task {webTask.Name} is already running");
                } 
            }
            return r;
        }
        private WebTask GetTask(TaskContext ctx, ITask task)
        {
            var t = task.GetType();
            var taskId = task.GetId();
            try
            {                
                var wt = ctx.Tasks.SingleOrDefault(x => string.Compare(x.TaskId, taskId, true) == 0);
                if (wt == null)
                {
                    wt = new WebTask();
                    wt.TaskId = taskId;
                    wt.Name = t.Name;
                    wt.Status = TaskStatus.Unknown;
                    ctx.Tasks.Add(wt);
                    ctx.SaveChanges();
                }
                return wt;
            }
            catch (Exception xe)
            {
                Logger.LogError($"GetTask() failed for task {taskId}", xe);
                throw;
            }
        }
        private void AddHistory(TaskContext ctx, WebTask wt)
        {
            TaskHistory th = new TaskHistory
            {
                Task = wt,
                Status = wt.Status,
                StartedAt = wt.StartedAt.Value,
                FinishedAt = wt.FinishedAt.Value,
                Remark = wt.CompletionRemark
            };
            ctx.TaskHistory.Add(th);
        }
    }
}
