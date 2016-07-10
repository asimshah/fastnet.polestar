using Microsoft.Web.Administration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class satellite
    {
        
        // the following properties come from appsettings.json
        public string name { get; set; }
        public string url { get; set; }
        public bool active { get; set; }
        public double version { get; set; }
        public SatelliteType type { get; set; }
        public string satelliteType { get { return type.ToString(); } }
        public bool isWebframeSource { get; set; }
        public bool isWebframeArchive { get; set; }
        public string webframeArchiveFolder { get; set; }

        // the following properties are set by calling FillLocalInformation()
        // Note: though there is a list of all satellites, only the current one is set up by calling FillLocalInformation
        public string assemblyVersion { get; set; }
        public string webframeRootDrive { get; set; }
        public string webframeMarkerDll { get; set; }
        public string machine { get; set; }
        public string siteRootFolder { get; set; }
        public string upgradeRootFolder { get; set; }
        public string backupFolder { get; set; }
        public bool webframeIsUploaded { get; set; }
        public version uploadedWebframeVersion { get; set; }

        // the following properties apply only if this satellite is a webframe source
        public version latestAvailableWebframeVersion { get; set; }
        public string publishingFolder { get; set; }
        public string distributionFolder { get; set; }
        public string polestarDestinationFolder { get; set; }
        public string polestarSourceFolder { get; set; }
        public List<site> sites { get; set; }
        internal void FillLocalInformation(PolestarConfiguration pc)
        {
            this.assemblyVersion = typeof(satellite).GetTypeInfo().Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                .InformationalVersion;
            this.machine = Environment.MachineName.ToLower();
            if (string.IsNullOrWhiteSpace(this.webframeRootDrive))
            {
                this.webframeRootDrive = Path.GetPathRoot(Environment.SystemDirectory);
            }
            this.siteRootFolder = GetSiteRootFolder();
            this.upgradeRootFolder = GetUpgradeRootFolder();
            this.backupFolder = GetBackupFolder();
            this.webframeMarkerDll = this.GetWebframeMarkerDll(pc);
            this.polestarDestinationFolder = this.GetPolestarDestinationFolder(pc);
            this.polestarSourceFolder = this.GetPolestarSourceFolder(pc);
            this.sites = new List<site>();
            if (this.isWebframeSource)
            {
                this.SetLatestAvailableWebframeVersion(pc);
                this.publishingFolder = this.GetWebframePublishFolder(pc);
            }
            //else 
            {
                this.distributionFolder = this.GetDistributionFolder(pc);
                var primaryDll = Path.Combine(this.distributionFolder, this.webframeMarkerDll);
                var version = new version { major = 0, minor = 0, revision = 0, build = 0 };
                bool available = false;
                if (System.IO.File.Exists(primaryDll))
                {
                    available = true;
                    Version v = AssemblyName.GetAssemblyName(primaryDll).Version;
                    version.major = v.Major; version.minor = v.Minor; version.revision = v.Revision; version.build = v.Build;
                }
                this.webframeIsUploaded = available;
                this.uploadedWebframeVersion = version;
                
                var tools = new IISHelper(this);
                var sites = new List<site>();
                foreach (Site ws in tools.Sites())
                {
                    site s = new site();
                    s.name = ws.Name.ToLower();
                    s.port = ws.Bindings.First().EndPoint.Port;
                    s.host = string.IsNullOrWhiteSpace(ws.Bindings.First().Host) ? string.Format("localhost:{0}", s.port) : ws.Bindings.First().Host;
                    s.poolName = ws.Applications.First().ApplicationPoolName;
                    s.path = tools.GetSitePhysicalpath(ws.Name);
                    s.isPaused = tools.IsPaused(s.path);
                    s.isWebframe = File.Exists(Path.Combine(s.path, webframeMarkerDll));// this.GetWebframeMarkerDll(pc)));
                    if (s.isWebframe)
                    {
                        Version v = AssemblyName.GetAssemblyName(Path.Combine(s.path, webframeMarkerDll)).Version;
                        s.version = new version() { major = v.Major, minor = v.Minor, build = v.Build, revision = v.Revision };
                        s.databaseNames = tools.GetDatabaseConnections(ws.Name).Select(x => x.Value).Distinct().ToArray();
                        s.isUpgradeable = this.uploadedWebframeVersion > s.version;
                    }
                    sites.Add(s);
                }
                this.sites = sites.OrderBy(o1 => o1.isWebframe).ThenBy(o2 => o2.name).ToList();
            }
        }
        private string GetSatelliteDistributionRootFolder()
        {
            return $@"{webframeRootDrive}Webframe\Deployment";
        }
        private string GetSiteRootFolder()
        {
            return $@"{webframeRootDrive}Webframe\Sites";
        }
        private string GetUpgradeRootFolder()
        {
            return $@"{webframeRootDrive}Webframe\Upgrades";
        }
        private string GetBackupFolder()
        {
            return $@"{webframeRootDrive}Webframe\backups";
        }
        private string GetBackupRootFolder()
        {
            return $@"{webframeRootDrive}Webframe\Backups";
        }
        //private string GetWebframeDeploymentFolder()
        //{
        //    return @"webframe4";
        //}
        private string GetWebframeMarkerDll(PolestarConfiguration pc)
        {
           // Debug.Assert(!(this.webframeMarkerDll == null && pc == null));
            return  pc.defaultLocations.WebframeMarkerDll;// @"bin\Fastnet.Webframe.Web.dll";
        }
        private string GetPolestarSourceFolder(PolestarConfiguration pc)
        {
            return $"{webframeRootDrive}{pc.defaultLocations.PolestarSourceFolder}";// Path.Combine(GetSatelliteDistributionRootFolder(), GetWebframeDeploymentFolder());
        }
        private string GetPolestarDestinationFolder(PolestarConfiguration pc)
        {
            return $"{webframeRootDrive}{pc.defaultLocations.PolestarDestinationFolder}";// Path.Combine(GetSatelliteDistributionRootFolder(), GetWebframeDeploymentFolder());
        }
        private string GetDistributionFolder(PolestarConfiguration pc)
        {
            return $"{webframeRootDrive}{pc.defaultLocations.DistributionFolder}";// Path.Combine(GetSatelliteDistributionRootFolder(), GetWebframeDeploymentFolder());
        }
        private string GetWebframePublishFolder(PolestarConfiguration pc)
        {
            return $"{webframeRootDrive}{pc.defaultLocations.PublishingFolder}";
            //string webframeDeploymentName = GetWebframeDeploymentFolder();
            //string folder = Path.Combine(webframePublishFolder, webframeDeploymentName);
            //return folder;
        }
        private void SetLatestAvailableWebframeVersion(PolestarConfiguration pc)
        {
            string publishFolder = this.GetWebframePublishFolder(pc);
            string primaryDll = this.webframeMarkerDll;//.GetWebframeMarkerDll(pc);// GetPrimaryDll();
            primaryDll = Path.Combine(publishFolder, primaryDll);
            if (System.IO.File.Exists(primaryDll))
            {
                Version v = AssemblyName.GetAssemblyName(primaryDll).Version;
                this.latestAvailableWebframeVersion = new version { major = v.Major, minor = v.Minor, build = v.Build, revision = v.Revision };
            }
            else
            {
                this.latestAvailableWebframeVersion = new version();
            }

        }
    }
}
