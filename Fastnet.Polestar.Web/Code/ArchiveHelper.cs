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
    public class ArchiveHelper
    {
        private readonly ILogger<ArchiveHelper> logger;
        private readonly satellite current;
        //private readonly satellite[] archivingSatellites;
        private readonly IEnumerable<satellite> otherSatellites;
        private readonly DateTime todayUtc;
        private readonly ITaskManager taskManager;
        //private readonly PolestarConfiguration config;
        public ArchiveHelper(satellite satellite, satellite[] allSatellites)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<ArchiveHelper>>();
            this.taskManager = ProviderHelper.ServiceProvider.GetService<ITaskManager>();
            this.current = satellite;
            this.todayUtc = DateTime.UtcNow;
            //this.archivingSatellites = allSatellites.Where(x => x != this.current && x.isWebframeSource == false && x.isWebframeArchive).ToArray();
            Uri currentUri = new Uri(this.current.url); ;
            this.otherSatellites = allSatellites.Where(x => x.active && x != this.current && x.isWebframeSource == false);
            if (currentUri.IsDefaultPort)
            {
                this.otherSatellites = this.otherSatellites.Where(x => new Uri(x.url).IsDefaultPort);
            }
            //logger.LogTrace($"{archivingSatellites.Count()} archiving satellites found");
            foreach(var s in this.otherSatellites)
            {                
                logger.LogTrace($"Archive(s) will be from {s.url}");
            }
        }
        //public IEnumerable<string> GetArchiveList(string satelliteName)
        //{
        //    var archiveFolder = Path.Combine(this.current.webframeArchiveFolder, satelliteName);
        //    if (Directory.Exists(archiveFolder))
        //    {
        //        var zipList = Directory.EnumerateFiles(archiveFolder, "*.zip")
        //            .OrderBy(fn => File.GetCreationTime(fn));
        //        return zipList.Select(x => Path.GetFileName(x));
        //    }
        //    else
        //    {
        //        return new string[0];
        //    }
        //}
        public async Task ArchiveBackups()
        {
            if (todayUtc.Hour > 3)
            {
                foreach (var s in otherSatellites)
                {
                    try
                    {
                        logger.LogTrace($"Archiving from {s.url}");
                        await createRequiredArchiveTasks(s);
                    }
                    catch (Exception xe)
                    {
                        logger.LogError($"Access to {s.url} failed", xe);
                    }
                }
            }
            else
            {
                logger.LogTrace($"Archiving not available at this time");
            }
        }

        private async Task createRequiredArchiveTasks(satellite s)
        {
            var listAtRemoteSatellite = await GetBackupList(s);
            var archiveFolder = Path.Combine(this.current.webframeArchiveFolder, s.name);
            if(!Directory.Exists(archiveFolder))
            {
                Directory.CreateDirectory(archiveFolder);
            }
            var listHere = Directory.EnumerateFiles(archiveFolder, "*.zip").Select(x => Path.GetFileName(x));
            var listToDownload = listAtRemoteSatellite.Except(listHere, StringComparer.InvariantCultureIgnoreCase);
            if (listToDownload.Count() > 0)
            {
                foreach (var bf in listToDownload)
                {
                    logger.LogInformation($"Archive task for {bf} from {s.url}");
                    var task = new ArchiveTask(current, s, bf);
                    await taskManager.StartAsync(task);
                } 
            }
            else
            {
                logger.LogTrace($"No archives required for {s.url}");
            }
        }

        private async Task<IEnumerable<string>> GetBackupList(satellite target)
        {
            var p2p = new Polestar2PolestarClient(target);
            return await p2p.GetBackupList();
        }

        //public async Task ArchiveBackupsOld()
        //{
        //    if (todayUtc.Hour > 3)
        //    {
        //        foreach (var s in archivingSatellites)
        //        {
        //            logger.LogTrace($"Archiving to {s.url}");
        //            await uploadRequiredBackups(s);
        //        }
        //    }
        //    else
        //    {
        //        logger.LogTrace($"Archiving not available at this time");
        //    }
        //}

        //private async Task uploadRequiredBackups(satellite target)
        //{
        //    var allBackups = Directory.EnumerateFiles(this.current.backupFolder, "*.zip")
        //        .Select(x => Path.GetFileName(x));
        //    var filesNeedingUpload = await selectBackupFiles(target, allBackups);
        //    foreach(var file in filesNeedingUpload)
        //    {
        //        logger.LogTrace($"Archive task for {file} to {target.url}");
        //        var task = new ArchiveTask(current, target, file);
        //        await taskManager.StartAsync(task);
        //    }
        //}

        //private async Task<IEnumerable<string>> selectBackupFiles(satellite target, IEnumerable<string> allBackups)
        //{
        //    var p2p = new Polestar2PolestarClient(target);
        //    var list = await p2p.GetArchiveList(current.name);
        //    return allBackups.Except(list);
        //}
    }
}
