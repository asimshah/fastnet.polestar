using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core.Web.Tasks;

namespace Fastnet.Polestar.Web
{
    public class BackupHelper
    {
        private readonly ILogger<BackupHelper> logger;
        private readonly satellite current;
        private readonly DateTime todayUtc;
        private readonly ITaskManager taskManager;
        public BackupHelper(ITaskManager tm,  satellite satellite)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<BackupHelper>>();
            this.taskManager = tm;
            this.current = satellite;
            this.todayUtc = DateTime.UtcNow;
        }

        public async Task BackupSite(string siteName)
        {
            var site = this.current.sites.SingleOrDefault(x => x.isWebframe && string.Compare(siteName, x.name, true) == 0);
            if (site != null)
            {
                var task = new BackupTask(this.current, site, GetBackupFilename(site));
                await taskManager.StartAsync(task);
            }
        }
        public async Task BackupSites()
        {
            var sites = this.current.sites.Where(x => x.isWebframe && ReadyToBackup(x));
            foreach(var site in sites)
            {
                string backupFilename = GetBackupFilename(site);
                logger.LogInformation($"Site {site.name} selected for backup to {backupFilename}");
                var task = new BackupTask(this.current, site, backupFilename);
                await taskManager.StartAsync(task);
            }
        }
        public IEnumerable<string> GetBackupList()
        {
            var backupFolder = Path.Combine(this.current.backupFolder);
            if (Directory.Exists(backupFolder))
            {
                var zipList = Directory.EnumerateFiles(backupFolder, "*.zip")
                    .OrderBy(fn => File.GetCreationTime(fn));
                return zipList.Select(x => Path.GetFileName(x));
            }
            else
            {
                return new string[0];
            }
        }
        private bool ReadyToBackup(site site)
        {
            // check that we are not in the first 2 hours of the day
            // because I want backups to occur after 02:00UTC
            //var now = DateTime.UtcNow;
            if (todayUtc.Hour < 2)
            {
                return false;
            }
            var backupFilename = GetBackupFilename(site);
            return !File.Exists(backupFilename);
        }

        private string GetBackupFilename(site site)
        {
            var name = $"{site.name}.{this.todayUtc:yyyy-MM-dd}.zip";
            return Path.Combine(current.backupFolder, name);
        }
    }
}
