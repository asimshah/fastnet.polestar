
using Fastnet.Core.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.IO;
using Fastnet.Core.Web.Tasks;

namespace Fastnet.Polestar.Web
{
    public class BackupTask : ITask
    {
        private site site;
        private satellite satellite;
        private string backupFilename;
        private readonly DbHelper dbh;
        public BackupTask(satellite satellite, site site, string backupFilename)
        {
            dbh = new DbHelper();
            this.satellite = satellite;
            this.site = site;
            this.backupFilename = backupFilename;
        }
        public string GetId()
        {
            return this.GetType().FullName;
        }
        public async Task<TaskResult> Execute(ILogger logger, params object[] args)
        {
            TaskResult tr = new TaskResult { Success = false };
            List<DbHelper.sqldbInfo> detachedDbs = null;
            using (var iis = new IISHelper(satellite))
            {
                try
                {
                    iis.PauseSite(this.site.name, "Closed for maintenance");
                    detachedDbs = await PrepareSite();
                    Backup();
                    tr.Success = true;
                    tr.CompletionRemark = $"Site {site.name} backed up to {this.backupFilename}";
                    logger.LogInformation($"Site {site.name} backed up to {this.backupFilename}");
                }
                catch (Exception xe)
                {
                    logger.LogError($"Backup failed for site {site.name}", xe);
                    tr.CompletionRemark = $"Backup failed for site {site.name}";
                    tr.Exception = xe;
                }
                finally
                {
                    foreach (var db in detachedDbs)
                    {
                        dbh.AttachDatabase(db.name, db.mdfName, db.ldfName);
                    }
                    iis.ResumeSite(this.site.name);

                }
                return tr;
            }
        }
        private async Task<List<DbHelper.sqldbInfo>> PrepareSite()
        {
            var list = new List<DbHelper.sqldbInfo>();            
            foreach(var db in site.databaseNames)
            {
                if(dbh.IsDatabaseInPath(db, site.path))
                {
                    list.Add(await dbh.DetachDatabase(db));
                }
            }
            return list;
        }
        private void Backup()
        {
            DirectoryInfo sourceFolder = new DirectoryInfo(site.path);
            string outputFile = this.backupFilename;
            var ph = new PlatformHelper();
            ph.BackupFolder(sourceFolder, outputFile);
        }
    }
}
