using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.IO;
using Fastnet.Core.Web.Tasks;

namespace Fastnet.Polestar.Web
{
    public class PurgeTask : ITask
    {
        const int retentionDays = 30;
        private readonly ILogger<BackupHelper> logger;
        private readonly satellite current;
        public PurgeTask(satellite satellite)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<BackupHelper>>();
            this.current = satellite;
        }
        public string GetId()
        {
            return this.GetType().FullName;
        }
        public async Task<TaskResult> Execute(ILogger logger, params object[] args)
        {
            TaskResult tr = new TaskResult { Success = false };
            try
            {
                var today = DateTime.Today;
                var retentionDate = today.AddDays(-retentionDays);
                var backupFolder = this.current.backupFolder;
                var zipList = Directory.EnumerateFiles(backupFolder, "*.zip");
                var deleteList = zipList.Where(fn => File.GetCreationTime(fn) < retentionDate);
                int count = 0;
                if (deleteList.Count() > 0)
                {
                    foreach (var filename in deleteList)
                    {
                        ++count;
                        File.Delete(filename);
                        await Task.Delay(100);
                        logger.LogInformation($"{filename} deleted");
                    } 
                }
                else
                {
                    logger.LogTrace($"No files to delete");
                }
                tr.Success = true;
                tr.CompletionRemark = $"{count} zip files deleted";
            }
            catch (Exception xe)
            {
                tr.CompletionRemark = xe.Message;
                tr.Exception = xe;
                logger.LogError($"PurgeTask failed", xe);
            }
            return tr;
        }
    }
}
