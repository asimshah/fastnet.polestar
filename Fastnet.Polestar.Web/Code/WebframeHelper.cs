using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class WebframeHelper
    {
        private readonly ILogger<WebframeHelper> logger;
        private readonly satellite current;
        public WebframeHelper(satellite satellite)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<WebframeHelper>>();
            this.current = satellite;
        }
        public async Task UpgradeSite(string siteName)
        {
            using (var iis = new IISHelper(current))
            {
                iis.PauseSite(siteName);
                await Task.Delay(1000); // wait for it to run down
                logger.LogInformation($"Site {siteName} paused");
                var sitePath = iis.GetSitePhysicalpath(siteName);
                var ph = new PlatformHelper();
                // copy existing site to safe location
                string oldSiteLocation = Path.Combine(current.upgradeRootFolder, siteName);
                if (Directory.Exists(oldSiteLocation))
                {
                    await ph.DeleteWithRetry(oldSiteLocation);
                }
                Directory.CreateDirectory(oldSiteLocation);
                ph.CopyAll(sitePath, oldSiteLocation);
                logger.LogInformation($"Existing files in {sitePath} copied to {oldSiteLocation}");
                // delete the current files for the site
                await ph.DeleteWithRetry(sitePath);
                // copy new files to the site path
                ph.CopyAll(current.distributionFolder, sitePath);
                logger.LogInformation($"New files copied from {current.distributionFolder} to {sitePath}");
                // copy database files back from the safe location
                string appdata = Path.Combine(sitePath, "App_Data");
                string oldAppdata = Path.Combine(oldSiteLocation, "App_Data");
                ph.CopyAll(oldAppdata, appdata);
                logger.LogInformation($"Files copied from {oldAppdata} to {appdata}");
                // copy custom stylesheets back from the safe location
                string customStylesheetFolder = Path.Combine(sitePath, "Content", "Main", "CustomLess");
                string previousCustomStylesheetFolder = Path.Combine(oldSiteLocation, "Content", "Main", "CustomLess");
                ph.CopyAll(previousCustomStylesheetFolder, customStylesheetFolder);
                logger.LogInformation($"Stylesheets copied from {oldAppdata} to {appdata}");
                // copy individual .user.css files back from the safe location
                string mainStylesheetFolder = Path.Combine(sitePath, "Content", "Main", "DefaultCSS");
                string previousMainStylesheetFolder = Path.Combine(oldSiteLocation, "Content", "Main", "DefaultCSS");
                foreach (var userCssFile in Directory.EnumerateFiles(previousMainStylesheetFolder, "*.user.css"))
                {
                    string destUserCssFilename = Path.Combine(mainStylesheetFolder, Path.GetFileName(userCssFile));
                    File.Copy(userCssFile, destUserCssFilename);
                    logger.LogInformation($"User stylesheet copied from {userCssFile} to {destUserCssFilename}");
                }
                // reset standard web.config settings and copy forward Customisation:Settings and MailEnabled
                var wch = new WebConfigHelper(current);
                var previousAppSettings = wch.GetApplicationSettings(oldSiteLocation);
                string customisation = null;
                if (previousAppSettings.ContainsKey("Customisation:Settings"))
                {
                    var temp = previousAppSettings["Customisation:Settings"];
                    var parts = temp.Split('.');
                    customisation = parts[1];
                }
                bool enablemail = false;
                if (previousAppSettings.ContainsKey("MailEnabled"))
                {
                    enablemail = Boolean.Parse(previousAppSettings["MailEnabled"]);
                }
                iis.UpdateConfigurationValues(siteName, customisation, enablemail);
                // copy mail settings from previous web.config
                wch.CopyMailSettings(oldSiteLocation, sitePath);
                logger.LogInformation($"Web.config in {sitePath} updated");
                iis.ResumeSite(siteName);
                logger.LogInformation($"Site {siteName} resumed");
            }
        }
        public async Task DeleteSite(string siteName)
        {
            logger.LogTrace($"current satellite is {(this.current == null ? "null" : "")} ");
            using (var iis = new IISHelper(current))
            {
                await iis.DeleteSite(siteName);
            }
        }
        public async Task CreateNewSite(newSite ns)
        {
            string siteName = ((string)ns.name).ToLower();
            string siteUrl = ns.url;
            string databaseName = siteName;
            string fromAddress = ns.fromAddress.ToLower();
            string customisation = ns.customisation?.ToLower();
            string legacyDatabase = ns.legacyDatabase?.ToLower();
            // (sql server database is created automatically)
            // (administrator credentials are asked for on first run)

            //await DetachDatabase(databaseName);// in case it is present for some reason 
            using (var iis = new IISHelper(current))
            {
                await iis.DeleteSite(siteName);
                string distributionFolder = current.distributionFolder;// SpecialFolders.GetDistributionFolder();
                //string sitepath = Path.Combine(current.GetSiteRootFolder(), siteName);
                string sitepath = Path.Combine(current.siteRootFolder, siteName);
                if (Directory.Exists(sitepath))
                {
                    Directory.Delete(sitepath, true);
                    logger.LogWarning($"Existing folder {sitepath} deleted!");
                }
                var ph = new PlatformHelper();
                ph.CopyAll(distributionFolder, sitepath);
                logger.LogInformation($"Files copied from {distributionFolder} to {sitepath}");
                // TODO: at this point all the files from the distribution are in the site path
                // Problem:
                // The normal scenario is that the custom less files should be logically empty (but structured like
                // .panelName
                // {
                // }
                // and the corresponding *.user.css file should be empty (or perhaps have the same content)
                // I *can't* safely provide this from the web distribution becuase the source project often has custom content
                // in some of these files as a result of testing during development (I don't have a post build task to clean this
                // up as I then have to re-enter this every time in order to continue testing). The publish step
                // does not appear to have hooks for a post publish task.
                // So, I have decided to do this here as I can tidy up the content after making a copy of the distribution
                // REMEMBER: all this is because asp.net bundling (in release mode) will not include missing files if they are written after the site
                // has started up - creation of these .less/.css files does not trigger a refreshed bundle - so I need to have them in 
                // place before the web site starts up (remember that legacy data loading can write content to custom/less/css files - but this
                // takes place after the site has started up - this will also be an issue when upgrading a v4 site!!)
                SaveStyleSheets(sitepath);
                logger.LogInformation($"Default style sheets written to {sitepath}");

                iis.CreateSiteInIIS(siteName, siteUrl, sitepath, customisation, legacyDatabase);
                var wch = new WebConfigHelper(current);
                wch.AddMailSettings(sitepath, fromAddress);
            }

        }
        private void SaveStyleSheets(string sitePath)
        {
            Func<string, string> getText = (pn) =>
            {
                return string.Format(".{0}\n{{\n\n}}\n", pn);
            };
            string[] panels = new string[] { "BannerPanel", "BrowserPanel", "CentrePanel", "ContentPanel", "LeftPanel", "MenuPanel", "RightPanel", "SitePanel" };
            foreach (var panel in panels)
            {
                string text = getText(panel);
                SaveStyleSheets(sitePath, panel, text, text);
            }
        }
        private void SaveStyleSheets(string sitePath, string panelName, string lessText, string cssText)
        {
            string filename = Path.Combine(GetCustomStylesheetFolder(sitePath), panelName + ".less");
            File.WriteAllText(filename, lessText);
            filename = Path.Combine(GetMainStylesheetFolder(sitePath), panelName + ".user.css");
            File.WriteAllText(filename, cssText);
        }
        private string GetMainStylesheetFolder(string sitePath)
        {
            return Path.Combine(sitePath, "Content", "Main", "DefaultCSS");
            //return HostingEnvironment.MapPath("~/Content/Main/DefaultCSS");
        }
        private string GetCustomStylesheetFolder(string sitePath)
        {
            string folder = Path.Combine(sitePath, "Content", "Main", "CustomLess");// HostingEnvironment.MapPath("~/Content/Main/CustomLess");
            if (!System.IO.Directory.Exists(folder))
            {
                System.IO.Directory.CreateDirectory(folder);
            }
            return folder;// HostingEnvironment.MapPath("~/Content/Main/CustomLess");
        }
        //private async Task<string> CopySitePreUpgrade(string siteName, string path)
        //{
        //    //string path = GetSitePhysicalPath(siteName);
        //    var ph = new PlatformHelper();
        //    string targetFolder = Path.Combine(current.upgradeRootFolder, siteName);
        //    if (Directory.Exists(targetFolder))
        //    {
        //        await ph.DeleteWithRetry(targetFolder);
        //    }
        //    Directory.CreateDirectory(targetFolder);
        //    ph.CopyAll(path, targetFolder);
        //    return targetFolder;
        //}
    }
}
