using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SqlServer.Management.Smo;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class DbHelper
    {
        public class sqldbInfo
        {
            public string name { get; set; }
            public string mdfName { get; set; }
            public string ldfName { get; set; }
        }
        const string sqlServerName = ".\\sqlexpress";
        private readonly ILogger<DbHelper> logger;
        //private readonly satellite current;
        private readonly PlatformHelper ph;
        public DbHelper()
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<DbHelper>>();
            ph = new PlatformHelper();
        }
        public string ConnectionString2Databasename(string connectionString)
        {
            var sb = new SqlConnectionStringBuilder(connectionString);
            return sb.InitialCatalog;
        }
        public async Task<sqldbInfo> DetachDatabase(string databaseName)
        {
            var result = new sqldbInfo();
            try
            {
                //string sqlServerName = ".\\sqlexpress";// GetSqlServerName();
                List<string> filelist = new List<string>();
                //string primaryPath = null;
                var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
                if (server.Databases.Contains(databaseName))
                {
                    
                    var dataFiles = new List<string>();
                    var logFiles = new List<string>();
                    Microsoft.SqlServer.Management.Smo.Database db = server.Databases[databaseName];
                    if (db.Status == Microsoft.SqlServer.Management.Smo.DatabaseStatus.Normal)
                    {
                        foreach (Microsoft.SqlServer.Management.Smo.FileGroup fg in db.FileGroups)
                        {
                            foreach (Microsoft.SqlServer.Management.Smo.DataFile df in fg.Files)
                            {
                                dataFiles.Add(df.FileName);
                                filelist.Add(df.FileName);
                            }
                        }
                        foreach (Microsoft.SqlServer.Management.Smo.LogFile lg in db.LogFiles)
                        {
                            logFiles.Add(lg.FileName);
                            filelist.Add(lg.FileName);
                        }
                        result.name = databaseName;
                        result.mdfName = dataFiles.First(); //!! I only ever have one
                        result.ldfName = logFiles.First(); //!! I only ever have one
                        db = null;
                    }
                }
                server = null;
                await ph.DetachSiteDatabaseNoSmo(sqlServerName, databaseName);
                bool localMachineIsInDomain = ph.IsInDomain();// string.Compare(Environment.UserDomainName, Environment.MachineName, true) != 0;
                List<string> fullControlUsers = new List<string>
                        {
                        "Network Service"
                        };
                if (localMachineIsInDomain)
                {
                    fullControlUsers.Add("Domain Admins");
                }
                foreach (string file in filelist)
                {
                    ph.SetFileAccessFullControl(file, fullControlUsers.ToArray());
                }
                logger.LogInformation($"Database {databaseName} detached");
                return result;
            }
            catch (Exception xe)
            {
                logger.LogError($"Detaching database {databaseName}", xe);
                throw;
            }
        }
        //public bool AttachDatabase(string sqlServerName, string databaseName, string mdfFile, string ldfFile)
        //{
        //    return AttachDatabase(sqlServerName, databaseName, mdfFile, ldfFile);
        //}
        public bool AttachDatabase(string databaseName, string mdfFile, string ldfFile)
        {
            bool result = false;
            ph.EnsureFileOwnership(mdfFile);
            ph.EnsureFileOwnership(ldfFile);
            ph.ResetSecurity(new string[] { mdfFile, ldfFile });
            var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
            if (!server.Databases.Contains(databaseName))
            {
                StringCollection sc = new StringCollection();
                sc.Add(mdfFile);
                sc.Add(ldfFile);
                server.AttachDatabase(databaseName, sc);
                result = true;
            }
            return result;
        }
        public bool IsDatabaseInPath(string databaseName, string path)
        {
            var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
            if (server.Databases.Contains(databaseName))
            {
                sqldbInfo info = new sqldbInfo();
                info.name = databaseName;
                var db = server.Databases[info.name];
                var fg = db.FileGroups["PRIMARY"];
                var list = new List<string>();
                foreach (DataFile file in fg.Files)
                {
                    list.Add(file.FileName);
                    break;
                }
                foreach (LogFile file in db.LogFiles)
                {
                    list.Add(file.FileName);
                    break;
                }
                return list.All(x => IsChild(path, x));
            }
            return false;
        }
        private bool IsChild(string path, string filename)
        {
            return filename.StartsWith(path, StringComparison.InvariantCultureIgnoreCase);
        }
    }
}
