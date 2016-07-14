using Ionic.Zip;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class DatabaseModel
    {
        public string Name { get; set; }
        public bool IsPresent { get; set; }
        public string Status { get; set; }
        public FileModel MdfFile { get; set; }
        public FileModel LdfFile { get; set; }
    }
    public class FileModel
    {
        public string Name { get; set; }
        public bool AccessFailed { get; set; }
        public string Owner { get; set; }
        public List<string> AccessRules { get; set; }
    }
    public enum NetJoinStatus
    {
        NetSetupUnknownStatus = 0,
        NetSetupUnjoined,
        NetSetupWorkgroupName,
        NetSetupDomainName
    }
    public class PlatformHelper
    {
        private readonly ILogger<PlatformHelper> logger;
        public const int ErrorSuccess = 0;
        [DllImport("NetApi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern int NetGetJoinInformation(string server, out IntPtr domain, out NetJoinStatus status);
        [DllImport("NetApi32.dll")]
        public static extern int NetApiBufferFree(IntPtr Bbuffer);
        public PlatformHelper()
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<PlatformHelper>>();
        }
        public bool IsInDomain()
        {
            try
            {
                NetJoinStatus status = NetJoinStatus.NetSetupUnknownStatus;
                IntPtr pDomain = IntPtr.Zero;
                int result = NetGetJoinInformation(null, out pDomain, out status);
                if (pDomain != IntPtr.Zero)
                {
                    NetApiBufferFree(pDomain);
                }
                if (result == ErrorSuccess)
                {
                    //Log.Trace("NetGetJoinInformation() returned status {0}", status.ToString());
                    if (status == NetJoinStatus.NetSetupDomainName)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    throw new Exception(string.Format("NetGetJoinInformation() returned error code {0}", result));
                }
            }
            catch (Exception xe)
            {
                //Log.Write(xe);
                logger.LogError(xe.Message);
                throw;
            }
        }
        public void SetFileAccessFullControl(string filename, string[] usernames)
        {
            int retryCount = 3;
            while (retryCount > 0)
            {

                try
                {
                    FileInfo fi = new FileInfo(filename);

                    FileSecurity fs = new FileSecurity();
                    foreach (string username in usernames)
                    {
                        FileSystemAccessRule rule = new FileSystemAccessRule(username, FileSystemRights.FullControl, AccessControlType.Allow);
                        fs.AddAccessRule(rule);
                    }
                    fi.SetAccessControl(fs);
                    retryCount = 0;
                }
                catch (Exception xe)
                {
                    --retryCount;
                    if (retryCount <= 0)
                    {
                        // when not connected to the domain (as in alka, for example) 
                        // I get exceptions here to do with having lost "trust" but not always - sometimes it all works
                        // no problem.
                        // I am ignoring this as in production at Chevening Road, there will
                        // never be a problem connecting to the domain controller
                        string users = string.Join(",", usernames);
                        //Log.Write(xe);
                        //Log.Write(EventSeverities.Error, "Unable to set security on file {0} for {1}", filename, users);
                        logger.LogError($"Unable to set security on file {filename} for {users}", xe);
                        break;
                    }
                    else
                    {
                        System.Threading.Thread.Sleep(500);
                    }
                }
            }
        }

        public FileModel GetFileModel(string filename)
        {
            var fm = new FileModel();
            fm.AccessFailed = true;
            try
            {
                fm.Name = filename;
                fm.AccessRules = new List<string>();
                fm.Owner = GetOwner(filename).ToString();
                var rules = File.GetAccessControl(filename).GetAccessRules(true, true, typeof(NTAccount));
                foreach (FileSystemAccessRule rule in rules)
                {
                    fm.AccessRules.Add(string.Format("{0}: {1}, {2}{3}",
                        rule.IdentityReference.Value, rule.FileSystemRights, rule.AccessControlType,
                       ", inheritance flags:  " + rule.InheritanceFlags.ToString()));
                    //Debug.Print("{1}: {0}", rule.FileSystemRights, rule.IdentityReference.Value);
                }
                fm.AccessFailed = false;
            }
            catch (Exception xe)
            {
                logger.LogError($"GetFileModel(): failed on file {filename}", xe);
            }
            return fm;
        }
        public DatabaseModel GetDatabaseInfo(string sqlServerName, string databaseName)
        {
            var dm = new DatabaseModel();
            dm.Name = databaseName;
            var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
            bool isPresent = server.Databases.Contains(dm.Name);
            if (isPresent)
            {
                var db = server.Databases[dm.Name];
                dm.Status = db.Status.ToString();
                var fg = db.FileGroups["PRIMARY"];
                foreach (Microsoft.SqlServer.Management.Smo.DataFile file in fg.Files)
                {
                    dm.MdfFile = GetFileModel(file.FileName);
                    break;
                }
                foreach (Microsoft.SqlServer.Management.Smo.LogFile file in db.LogFiles)
                {
                    dm.LdfFile = GetFileModel(file.FileName);
                    break;
                }
            }
            return dm;
        }
        public async Task DetachSiteDatabaseNoSmo(string sqlServerName, string databaseName)
        {
            var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
            bool isPresent = server.Databases.Contains(databaseName);
            bool isNormal = false;
            if (isPresent)
            {
                var db = server.Databases[databaseName];
                if ((db.Status & Microsoft.SqlServer.Management.Smo.DatabaseStatus.Normal) == 0)
                {
                    var status = db.Status;
                    logger.LogWarning($"{databaseName}: unexpected database status {status.ToString()} ");
                    try
                    {
                        await DetachDatabase(sqlServerName, databaseName);
                        //logger.LogInformation($"database {databaseName} (in {status}) detached");
                    }
                    catch (Exception xe)
                    {
                        logger.LogError($"Attempting to detach {databaseName} (in {status})",xe);
                    }
                }
                else
                {
                    isNormal = true;
                }
                db = null;
            }
            server = null;
            await Task.Delay(500);
            GC.Collect();
            if (isPresent && isNormal)
            {
                await DetachDatabase(sqlServerName, databaseName);
            }
        }
        public bool CopyAll(string source, string destination)
        {
            return CopyAll(new DirectoryInfo(source), new DirectoryInfo(destination));
        }
        public bool CopyAll(DirectoryInfo source, DirectoryInfo target)
        {
            if (Directory.Exists(source.FullName))
            {
                bool localMachineIsInDomain = IsInDomain();// string.Compare(Environment.UserDomainName, Environment.MachineName, true) != 0;
                List<string> fullControlUsers = new List<string>
                    {
                    "Network Service"
                    };
                if (localMachineIsInDomain)
                {
                    fullControlUsers.Add("Domain Admins");
                    //fullControlUsers.Add("Webframe Computers");
                }
                bool result = true;
                //Log.Trace("CopyAll(): {0}, {1}", source.FullName, target.FullName);
                if (source.FullName.ToLower() == target.FullName.ToLower())
                {
                    logger.LogInformation($"CopyAll skipped: Source {source.FullName} and target {target.FullName} are identical");
                    return result;
                }
                // Check if the target directory exists, if not, create it.
                if (Directory.Exists(target.FullName) == false || ProbeDirectory(target.FullName) == false)
                {
                    Directory.CreateDirectory(target.FullName);
                    SetDirectoryAccessFullControl(target.FullName, fullControlUsers.ToArray());
                    logger.LogInformation($"Directory {target.FullName} created");
                }

                // Copy each file into it's new directory.
                foreach (FileInfo fi in source.GetFiles())
                {
                    int retryCount = 3;
                    while (retryCount > 0)
                    {
                        try
                        {
                            string dest = Path.Combine(target.ToString(), fi.Name);
                            fi.CopyTo(dest, true);
                            SetFileAccessFullControl(dest, fullControlUsers.ToArray());
                            break;
                        }
                        catch (Exception xe)
                        {
                            logger.LogError($"File copy failed, retry number {retryCount}", xe);
                            --retryCount;
                            if (retryCount == 0)
                            {
                                logger.LogError($"File {fi.Name} copy failed");
                                //Log.Write(EventSeverities.Error, "File {0} copy failed", fi.Name);
                                result = false;
                            }
                            else
                            {
                                System.Threading.Thread.Sleep(500);
                            }
                        }
                    }
                }
                if (result)
                {
                    // Copy each subdirectory using recursion.
                    foreach (DirectoryInfo diSourceSubDir in source.GetDirectories())
                    {
                        DirectoryInfo nextTargetSubDir =
                            target.CreateSubdirectory(diSourceSubDir.Name);
                        //Log.Trace("Directory {0} created", nextTargetSubDir.FullName);
                        result = CopyAll(diSourceSubDir, nextTargetSubDir);
                    }
                }
                return result;
            }
            else
            {
                logger.LogInformation($"{source.FullName} not found - copyall failed");
                return false;
            }
        }
        public bool BackupFolder(DirectoryInfo sourceFolder, string outputFilename)
        {
            bool result = false;
            try
            {
                if (sourceFolder.Exists)
                {
                    string outputPath = Path.GetDirectoryName(outputFilename);
                    if (!Directory.Exists(outputPath))
                    {
                        Directory.CreateDirectory(outputPath);
                        logger.LogInformation($"output directory {outputPath} created");
                    }
                    if (File.Exists(outputFilename))
                    {
                        File.Delete(outputFilename);
                        logger.LogInformation($"existing file {outputFilename} deleted");
                    }
                    using (ZipFile zip = new ZipFile())
                    {
                        zip.UseZip64WhenSaving = Zip64Option.Always;
                        zip.SaveProgress += (s, e) =>
                        {
                            switch (e.EventType)
                            {
                                case ZipProgressEventType.Saving_AfterWriteEntry:
                                    //Debug.Print("zipping: file {0}", e.CurrentEntry.FileName);
                                    //Log.Write("zipping: file {0}", e.CurrentEntry.FileName);
                                    break;
                                default:
                                    //Debug.Print("zipping: event {0}", e.EventType.ToString());
                                    break;
                            }

                        };
                        zip.ZipError += (s, e) =>
                        {
                            logger.LogInformation($"file {e.FileName}, error: {e.Exception.Message}, skipped");
                            e.CurrentEntry.ZipErrorAction = ZipErrorAction.Skip;
                        };
                        zip.ParallelDeflateThreshold = -1;
                        zip.AddDirectory(sourceFolder.FullName, sourceFolder.Name);
                        logger.LogTrace($"folder {sourceFolder.FullName} backup to {outputFilename} started ...");
                        zip.Save(outputFilename);
                        logger.LogTrace($"folder {sourceFolder.FullName} backup to {outputFilename} finished");
                    }
                }
            }
            catch (Exception xe)
            {
                logger.LogError($"backup failed, source: {sourceFolder.FullName}, output {outputFilename}", xe);
                throw;
            }
            return result;
        }
        public async Task DeleteWithRetry(string path)
        {
            if (path != null && Directory.Exists(path))
            {
                int retryCount = 3;
                int[] delays = new int[] { 3000, 2000, 1000 };
                do
                {
                    await Task.Run(() =>
                    {
                        try
                        {
                            Directory.Delete(path, true);
                        }
                        catch { }
                    });
                    if (retryCount == 0)
                    {
                        break;
                    }
                    if (Directory.Exists(path))
                    {
                        logger.LogInformation($"Retrying delete {path} ... {retryCount}");
                        await Task.Delay(delays[retryCount-- - 1]);
                    }
                } while (Directory.Exists(path));
            }
        }
        //
        private void SetDirectoryAccessFullControl(string directoryName, string[] usernames)
        {
            if (Directory.Exists(directoryName))
            {
                int retryCount = 3;
                while (retryCount > 0)
                {
                    try
                    {
                        DirectoryInfo di = new DirectoryInfo(directoryName);
                        DirectorySecurity ds = new DirectorySecurity();
                        foreach (string username in usernames)
                        {
                            //FileSystemAccessRule rule = new FileSystemAccessRule(username, FileSystemRights.FullControl, AccessControlType.Allow);
                            FileSystemAccessRule rule = new FileSystemAccessRule(username, FileSystemRights.FullControl,
                                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.InheritOnly, AccessControlType.Allow);
                            ds.AddAccessRule(rule);
                        }
                        di.SetAccessControl(ds);
                        break;
                    }
                    catch (Exception xe)
                    {
                        string users = string.Join(",", usernames);
                        //Log.Write(xe);
                        logger.LogError($"Unable to set security of directory {directoryName} for {users}", xe);
                        --retryCount;
                        if (retryCount == 0)
                        {
                            break;
                        }
                        else
                        {
                            System.Threading.Thread.Sleep(500);
                        }
                    }
                }
            }
        }
        public bool IsSqlServerRunning(string sqlServerName, string databaseName)
        {
            bool result = false;
            SqlConnectionStringBuilder scb = new SqlConnectionStringBuilder();
            scb.DataSource = sqlServerName;
            scb.InitialCatalog = databaseName;
            scb.IntegratedSecurity = true;
            string connectionString = scb.ToString();
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("select 1", con);
                int answer = (int)cmd.ExecuteScalar();
                if (answer == 1)
                {
                    result = true;
                }
                cmd.Dispose();
            }
            return result;
            //DataTable x = SmoApplication.EnumAvailableSqlServers(true);
            //Server server = new Server(sqlServerName);
            //Debug.Print("{0} databases", server.Databases.Count);
            //return server.Status == ServerStatus.Online;
        }
        private async Task DetachDatabase(string sqlServerName, string databaseName)
        {
            try
            {
                await DropConnections(sqlServerName, databaseName);
                var server = new Microsoft.SqlServer.Management.Smo.Server(sqlServerName);
                server.DetachDatabase(databaseName, false);
                logger.LogInformation($"Database {databaseName} detached");
            }
            catch (Exception xe)
            {
                logger.LogError($"DetachDatabase() failed", xe);
            }
        }
        private async Task DropConnections(string sqlServerName, string databaseName)
        {
            SqlConnectionStringBuilder scb = new SqlConnectionStringBuilder();
            scb.DataSource = sqlServerName;
            scb.InitialCatalog = databaseName;
            scb.IntegratedSecurity = true;
            string connectionString = scb.ToString();
            SqlConnection con = new SqlConnection(connectionString);
            //
            Func<string, Task> exec = async (query) =>
            {
                try
                {
                    SqlCommand cmd = new SqlCommand(query, con);
                    await cmd.ExecuteNonQueryAsync();
                    //cmd.ExecuteNonQuery();
                    //Log.Trace("Executed: {0}", cmd.CommandText);
                    cmd.Dispose();
                }
                catch (Exception xe)
                {
                    logger.LogError($"DropConnections(): query {query} failed", xe);
                }
            };
            await Task.Run(async () =>
            {
                using (con)
                {
                    con.Open();

                    await exec(string.Format("ALTER DATABASE [{0}] SET OFFLINE WITH ROLLBACK IMMEDIATE;", databaseName));
                    await Task.Delay(1000);
                    //System.Threading.Thread.Sleep(1000);
                    await exec(string.Format("ALTER DATABASE [{0}] SET ONLINE WITH ROLLBACK IMMEDIATE;", databaseName));
                    await Task.Delay(1000);
                    //System.Threading.Thread.Sleep(1000);
                    SqlConnection.ClearPool(con);
                    con.Close();
                }
            });
        }
        private bool ProbeDirectory(string targetDirectory)
        {
            return true;
            //if (ApplicationSettings.Key("UseDirectoryProbing", false))
            //{

            //    bool result = false;
            //    try
            //    {
            //        Log.Write("ProbeDirectory(): {0}", targetDirectory);
            //        string testfilename = Path.Combine(targetDirectory, "test.txt");
            //        try
            //        {
            //            File.WriteAllText(testfilename, "test data from ProbeDirectory()");
            //            try
            //            {
            //                File.Delete(testfilename);
            //                result = true;
            //            }
            //            catch (Exception xe)
            //            {
            //                Log.Write(xe);
            //                Log.Write("ProbeDirectory(): {0},  test file delete failed", targetDirectory);
            //            }
            //        }
            //        catch (Exception xe)
            //        {
            //            Log.Write(xe);
            //            Log.Write("ProbeDirectory(): {0},  test file write failed", targetDirectory);
            //        }

            //    }
            //    catch (Exception xe)
            //    {
            //        Log.Write(xe);
            //        Log.Write("ProbeDirectory(): {0} failed", targetDirectory);
            //    }
            //    return result;
            //}
            //else
            //{
            //    return true;
            //}
        }
        public void ResetSecurity(IEnumerable<string> dbFiles)
        {
            List<string> fullControlUsers = new List<string>() { "Network Service" };
            if (IsInDomain())
            {
                fullControlUsers.Add("Domain Admins");
            }
            foreach (string filename in dbFiles)
            {
                SetFileAccessFullControl(filename, fullControlUsers.ToArray());
            }
        }
        public void EnsureFileOwnership(string file)
        {
            NTAccount current = GetCurrentAccount();
            NTAccount fileOwner = GetOwner(file);
            if (string.Compare(current.Value, fileOwner.Value, true) != 0)
            {
                //logger.LogInformation($"{file}, ownership changing from {fileOwner.Value} to {current.Value} ...");
                var fs = File.GetAccessControl(file);
                fs.SetOwner(current);
                logger.LogInformation($"{file}, ownership changed from {fileOwner.Value} to {current.Value}", file, fileOwner.Value, current.Value);
            }
        }
        private  NTAccount GetCurrentAccount()
        {
            WindowsIdentity identity = WindowsIdentity.GetCurrent();
            return new NTAccount(identity.Name);
            //return new NTAccount(Environment.UserDomainName, Environment.UserName);
        }
        private NTAccount GetOwner(string filename)
        {
            var fs = File.GetAccessControl(filename);
            IdentityReference sid = fs.GetOwner(typeof(SecurityIdentifier));
            return sid.Translate(typeof(NTAccount)) as NTAccount;
        }
    }
}
