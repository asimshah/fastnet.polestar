using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public interface ITask
    {
        string GetId();
        Task<TaskResult> Execute(ILogger logger, params object[] args);
    }
    public interface ITaskManager
    {
        void Initialise();
        Task<TaskResult> StartAsync<T>(params object[] args) where T : ITask, new();
        void StartAndForget<T>(params object[] args) where T : ITask, new();
        Task<TaskResult> StartAsync(ITask task, params object[] args);
        void StartAndForget(ITask task, params object[] args);
        IEnumerable<TaskHistory> GetHistory(string taskId);
        IEnumerable<TaskHistory> GetHistory<T>() where T : ITask;
    }
}
