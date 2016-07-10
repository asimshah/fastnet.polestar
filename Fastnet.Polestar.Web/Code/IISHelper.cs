using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Web.Administration;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class IISHelper : IDisposable
    {
        private readonly ILogger<IISHelper> logger;
        private satellite current;
        private ServerManager sm;
        private readonly DbHelper dbh;
        private Site[] sites;
        public IISHelper(satellite s)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<IISHelper>>();
            this.current = s;
            dbh = new DbHelper();
            sm = new ServerManager();
            sites = sm.Sites.ToArray();
        }
        public IEnumerable<Site> Sites()
        {
            foreach (Site site in sites.ToArray())
            {
                yield return site;
            }
        }
        public bool IsPaused(string path)
        {
            string appOffline = Path.Combine(path, "app_offline.htm");
            return File.Exists(appOffline);
        }
        public void ResumeSite(string siteName)
        {
            var path = this.GetSitePhysicalpath(siteName);
            if (path != null)
            {
                string appOffline = Path.Combine(path, "app_offline.htm");
                if (File.Exists(appOffline))
                {
                    File.Delete(appOffline);
                }
            }
        }
        public void PauseSite(string siteName, string reason = "Paused by polestar")
        {
            var path = this.GetSitePhysicalpath(siteName);
            if (path != null)
            {
                string html = $"<div style='color:red; margin: 10px; font-size: 18px;'>{reason}</div>";
                string appOffline = Path.Combine(path, "app_offline.htm");
                File.WriteAllText(appOffline, html);
            }
        }
        public string GetSitePhysicalpath(string siteName)
        {
            string path = null;
            Site site;
            if (GetSite(siteName, out site))
            {
                var app = site.Applications.First();
                //var poolName = app.ApplicationPoolName;
                var virtualDirectoryCount = app.VirtualDirectories.Count();
                var virtualDirectory = app.VirtualDirectories.First();
                path = virtualDirectory.PhysicalPath;
            }
            return path;
            //return sm.GetSitePhysicalpath(siteName);
        }
        public Dictionary<string, string> GetDatabaseConnections(string siteName)
        {
            Dictionary<string, string> list = new Dictionary<string, string>();
            Site site;
            if (GetSite(siteName, out site))
            {
                var connectionStringsElements = site.GetWebConfiguration().GetSection("connectionStrings").GetCollection();
                foreach (var x in connectionStringsElements)
                {
                    var name = dbh.ConnectionString2Databasename((string)x["connectionString"]);
                    if (!string.IsNullOrWhiteSpace(name))
                    {
                        list.Add((string)x["name"], dbh.ConnectionString2Databasename((string)x["connectionString"]));
                    }
                }
            }
            return list;
        }
        public async Task DeleteSite(string siteName)
        {
            try
            {
                if(current == null || current.webframeMarkerDll == null)
                {
                    logger.LogCritical($"current satellite not available/initialised - delete site will fail");
                }
                var databaseNames = new List<string>();
                var path = GetSitePhysicalpath(siteName);
                if (path != null)
                {
                    //var primaryDll = Path.Combine(path, Global.GetPrimaryDll());
                    var primaryDll = Path.Combine(path, current.webframeMarkerDll);// .GetWebframeMarkerDll());// .GetPrimaryDll());
                    if (File.Exists(primaryDll))
                    {
                        var connections = GetDatabaseConnections(siteName);
                        Version version = AssemblyName.GetAssemblyName(primaryDll).Version;
                        if (version.Major < 4)
                        {
                            if (connections.ContainsKey("ApplicationServices"))
                            {
                                databaseNames.Add(connections["ApplicationServices"]);
                            }
                            if (connections.ContainsKey("BookingServices"))
                            {
                                databaseNames.Add(connections["BookingServices"]);
                            }
                        }
                        else
                        {
                            databaseNames.Add(connections["CoreData"]);
                        }
                    }
                }
                foreach (string db in databaseNames)
                {
                    logger.LogInformation($"Detaching database {db}");
                    
                    await dbh.DetachDatabase(db);
                }
                var ph = new PlatformHelper();
                await ph.DeleteWithRetry(path);
                RemoveSite(siteName);
                sm.CommitChanges();
            }
            catch (Exception xe)
            {
                logger.LogError($"Delete site failed", xe);
                //Log.Write(xe);
                throw;
            }
        }
        public void CreateSiteInIIS(string siteName, string siteUrl, string sitePath, string customisation, string legacyDatabase)
        {
            //string databaseName = siteName;
            // SatelliteProperties sp = SatelliteProperties.Load();
            //bool isLocal = sp.Type == SatelliteType.Local;// "local"; // local sites need to use unique port numbers not host entries
            bool isLocal = current.type == SatelliteType.Local || current.type == SatelliteType.Development;
            int port = 80;
            if (isLocal)
            {
                port = GetUniquePort();
            }
            try
            {
                Site newSite = sm.Sites.Add(siteName, sitePath, port);
                if (port == 80)
                {
                    newSite.Bindings.Clear();
                    newSite.Bindings.Add(string.Format("*:80:{0}", siteUrl), "http");
                }
                string poolName = siteName.ToLower();
                ApplicationPool pool = sm.ApplicationPools.Add(poolName);
                pool.Enable32BitAppOnWin64 = true;
                pool.ManagedPipelineMode = ManagedPipelineMode.Integrated;
                pool.ManagedRuntimeVersion = "v4.0";
                pool.ProcessModel.IdentityType = ProcessModelIdentityType.NetworkService;
                newSite.Applications[0].ApplicationPoolName = poolName;
                sm.CommitChanges();
                var temp = port == 80 ? $", bound to {siteUrl}" : "";
                logger.LogInformation($"Site {siteName} created, pool {poolName}, virtual directory {sitePath}, port {port}{temp}");
                Microsoft.Web.Administration.Configuration config = newSite.GetWebConfiguration();
                SetStandardConfigurationValues(config, port, siteUrl, customisation);
                SetDataConnection(config, "CoreData", siteName, true);
                bool seedLegacyData = !string.IsNullOrWhiteSpace(legacyDatabase);
                if (seedLegacyData)
                {
                    AddAppSetting(config, "LegacyDataLoad", "true");
                    SetDataConnection(config, "LegacyData", legacyDatabase);
                    if (legacyDatabase.Contains("-"))
                    {
                        string legacyBookingDb = legacyDatabase.Replace("-", "-booking-");
                        SetDataConnection(config, "LegacyBooking", legacyBookingDb);
                    }
                }
                sm.CommitChanges();
            }
            catch (Exception xe)
            {
                logger.LogError($"CreateSiteInIIS() failed", xe);
                //Log.Write(xe);
                //Debugger.Break();
                throw;
            }
        }
        public void UpdateConfigurationValues(string siteName, string customisation, bool enablemail)
        {
            Site site = sm.Sites.Single(x => x.Name == siteName);
            Binding binding = site.Bindings.First();
            int port = binding.EndPoint.Port;
            string siteUrl = binding.Host;
            Microsoft.Web.Administration.Configuration config = site.GetWebConfiguration();
            SetStandardConfigurationValues(config, port, siteUrl, customisation);
            if (enablemail)
            {
                AddAppSetting(config, "MailEnabled", "true");
            }
            SetDataConnection(config, "CoreData", siteName, true);
            sm.CommitChanges();
        }
        public void Dispose()
        {
            if (sm != null)
            {
                sm.Dispose();
            }
        }
        private int GetUniquePort()
        {
            try
            {
                List<int> ports = new List<int>();
                foreach (Site site in sm.Sites)
                {
                    Binding binding = site.Bindings.FirstOrDefault();
                    if (binding != null && binding.EndPoint != null)
                    {
                        int p = binding.EndPoint.Port;
                        if (p >= 10500 && p <= 11000)
                        {
                            ports.Add(p);
                        }
                    }
                }
                int port = ports.Count() > 0 ? ports.Max() : 10499;
                return port + 1;
            }
            catch (Exception xe)
            {
                logger.LogError($"GetUniquePort() failed", xe);
                //Debugger.Break();
                throw;
            }
        }
        private void SetDataConnection(Configuration config, string name, string dbName, bool attachToAppData = false)
        {
            SqlConnectionStringBuilder sb = new SqlConnectionStringBuilder();
            sb.InitialCatalog = dbName;
            sb.DataSource = ".\\sqlexpress";
            sb.IntegratedSecurity = true;
            sb.MultipleActiveResultSets = true;
            if (attachToAppData)
            {
                sb.AttachDBFilename = "|DataDirectory|\\sitedb.mdf";
            }
            ConfigurationSection connectionStringSection = config.GetSection("connectionStrings");
            ConfigurationElementCollection connectionStringsElements = connectionStringSection.GetCollection();
            ConfigurationElement connectionStringElement = connectionStringsElements.SingleOrDefault(x => (string)x["name"] == name);
            bool exists = connectionStringElement != null;
            if (!exists)
            {
                connectionStringElement = connectionStringsElements.CreateElement();
                connectionStringElement["name"] = name;
                connectionStringElement["providerName"] = "System.Data.SqlClient";

            }
            //var connectionString = (string)connectionStringElement["connectionString"];
            //SqlConnectionStringBuilder sb = new SqlConnectionStringBuilder(connectionString);
            //sb.InitialCatalog = dbName;
            string cs = sb.ToString();
            connectionStringElement["connectionString"] = cs;
            if (!exists)
            {
                connectionStringsElements.Add(connectionStringElement);
            }
            logger.LogInformation($"Connection string {name} set to {cs}");
        }
        private void AddAppSetting(Configuration config, string key, string value)
        {
            ConfigurationSection appSettingsSection = config.GetSection("appSettings");
            ConfigurationElementCollection appSettingsElements = appSettingsSection.GetCollection();
            if (appSettingsElements.Any(ce => (string)ce.Attributes["key"].Value == key))
            {
                appSettingsElements.Remove(appSettingsElements.First(ce => (string)ce.Attributes["key"].Value == key));
            }
            var newElement = appSettingsElements.CreateElement("add");
            newElement["value"] = value;
            newElement["key"] = key;
            appSettingsElements.Add(newElement);
            logger.LogInformation($"Added appSetting key=\"{key}\" value=\"{value}\"");
        }
        private void RemoveAppSetting(Configuration config, string key)
        {
            ConfigurationSection appSettingsSection = config.GetSection("appSettings");
            ConfigurationElementCollection appSettingsElements = appSettingsSection.GetCollection();
            if (appSettingsElements.Any(ce => (string)ce.Attributes["key"].Value == key))
            {
                appSettingsElements.Remove(appSettingsElements.First(ce => (string)ce.Attributes["key"].Value == key));
            }
        }
        private void SetStandardConfigurationValues(Configuration config, int port, string siteUrl, string customisation)
        {
            ConfigurationElementCollection documents = config.GetSection("system.webServer/defaultDocument").GetCollection("files");
            documents.Clear();
            ConfigurationElement document = documents.CreateElement();
            document["value"] = "default.aspx";
            documents.Add(document);
            //Log.Write("Site {0} port {1} created in IIS", siteName, port);
            //Microsoft.Web.Administration.Configuration config = newSite.GetWebConfiguration();
            ConfigurationSection appSettingsSection = config.GetSection("appSettings");
            ConfigurationElementCollection appSettingsElements = appSettingsSection.GetCollection();

            if (true /*ApplicationSettings.Key("AddReCaptchaKeys", false)*/)
            {
                AddAppSetting(config, "ReCaptchaPrivateKey", "6LeuTcQSAAAAAM4gU6GI-E5ofghKvlqNiGJgM2PV");
                AddAppSetting(config, "ReCaptchaPublicKey", "6LeuTcQSAAAAAE5GTRuSL2rjH8bwWJ6oV_aYxrYx");
            }
            if (port == 80)
            {
                AddAppSetting(config, "SiteUrl", siteUrl);
            }
            else
            {
                AddAppSetting(config, "SiteUrl", string.Format("localhost:{0}", port));
                AddAppSetting(config, "LocalAuthority", string.Format("localhost:{0}", port)); // what is this for?
            }
            if (string.IsNullOrWhiteSpace(customisation))
            {
                RemoveAppSetting(config, "Customisation:Settings");
            }
            else
            {
                AddAppSetting(config, "Customisation:Settings", string.Format("customisation.{0}.json", customisation));
            }
            //AddMailSettings(config);

        }
        private void RemoveSite(string siteName)
        {
            Site site;
            if (GetSite(siteName, out site))
            {
                switch (site.State)
                {
                    case ObjectState.Stopped:
                        break;
                    default:
                        site.Stop();
                        logger.LogInformation($"Site {site.Name} stopped", site.Name);
                        break;
                }
                sm.Sites.Remove(site);
                logger.LogInformation($"Site {siteName} removed", siteName);
                string poolName = site.Name.ToLower();
                if (sm.ApplicationPools.Any(x => x.Name == poolName))
                {
                    ApplicationPool pool = sm.ApplicationPools.First(x => x.Name == poolName);
                    sm.ApplicationPools.Remove(pool);
                    logger.LogInformation($"Pool {poolName} removed");
                }
            }
        }
        private bool GetSite(string siteName, out Site site)
        {
            if (sm.Sites.Any(x => string.Compare(x.Name, siteName, true) == 0))
            {
                site = sm.Sites.Single(x => string.Compare(x.Name, siteName, true) == 0);
                return true;
            }
            site = null;
            return false;
        }
    }
}
