using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net.Configuration;

namespace Fastnet.Polestar.Web
{
    public class WebConfigHelper
    {
        private readonly ILogger<WebConfigHelper> logger;
        private readonly satellite current;
        public WebConfigHelper(satellite satellite)
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<WebConfigHelper>>();
            this.current = satellite;
        }
        public void CopyMailSettings(string srcPath, string destPath)
        {
            string from = null;
            string host = null;
            string userName = null;
            string password = null;
            bool defaultCredentials = false;
            int smtpPort = 0;
            bool enableSsl = false;
            this.GetMailSettings(srcPath, out from, out host, out userName, out password, out defaultCredentials, out smtpPort, out enableSsl);
            var sysConfig = this.GetConfiguration(destPath);
            var mailSettings = this.GetMailSettings(sysConfig);// sysConfig.GetSectionGroup("system.net/mailSettings") as System.Net.Configuration.MailSettingsSectionGroup;
            this.SetMailSettings(mailSettings, from, host, userName, password, defaultCredentials, smtpPort, enableSsl);
            sysConfig.Save();
        }
        public IDictionary<string, string> GetApplicationSettings(string path)
        {
            Dictionary<string, string> settings = new Dictionary<string, string>();
            var config = GetConfiguration(path);
            KeyValueConfigurationCollection z = config.AppSettings.Settings;
            foreach (var item in z.AllKeys)
            {
                string key = z[item].Key;
                string value = z[item].Value;
                settings.Add(key, value);
            }
            return settings;
        }
        public void AddMailSettings(string path, string fromAddress)
        {
            //var sp = SatelliteProperties.Load();
            //string type = sp.Type.ToLower();
            Configuration config = GetConfiguration(path);
            MailSettingsSectionGroup mailSettings = GetMailSettings(config);
            string from = fromAddress;
            string host = null;
            string userName = null;
            string password = null;
            bool defaultCredentials = false;
            int port = 0;
            bool enableSsl = false;
            mailSettings.Smtp.From = fromAddress;// "noreply@webframe.co.uk";
            switch (current.type)
            {
                case SatelliteType.Development:// "development":
                case SatelliteType.Local:// "local":
                    //mailSettings.Smtp.From = "noreply@webframe.co.uk";
                    host = "smtp.gmail.com";
                    userName = "asimshah2009@gmail.com";
                    password = "n0kia@inV01ce";
                    defaultCredentials = false;
                    port = 587;
                    enableSsl = true;
                    break;
                case SatelliteType.Test:// "test":
                    //mailSettings.Smtp.From = "noreply@webframe.co.uk";
                    host = "smtp.gmail.com";
                    userName = "mbatbox@gmail.com";
                    password = "webframe01";
                    defaultCredentials = false;
                    port = 587;
                    enableSsl = true;
                    break;
                case SatelliteType.Live:// "live":
                    //noreply@booking.donwhillanshut.co.uk
                    //mailSettings.Smtp.From = "noreply@webframe.co.uk";
                    host = "127.0.0.1";
                    userName = null;
                    password = null;
                    defaultCredentials = true;
                    port = 25;
                    enableSsl = false;
                    break;
            }
            SetMailSettings(mailSettings, from, host, userName, password, defaultCredentials, port, enableSsl);
            config.Save();
        }
        //
        private MailSettingsSectionGroup GetMailSettings(Configuration config)
        {
            return config.GetSectionGroup("system.net/mailSettings") as MailSettingsSectionGroup;
        }
        private Configuration GetConfiguration(string path)
        {
            string webConfig = Path.Combine(path, "web.config");
            var map = new ExeConfigurationFileMap();
            map.ExeConfigFilename = webConfig;
            var config = ConfigurationManager.OpenMappedExeConfiguration(map, ConfigurationUserLevel.None);
            return config;
        }
        private void GetMailSettings(string path, out string from, out string host, out string userName, out string password, out bool defaultCredentials, out int port, out bool enableSsl)
        {
            string webConfig = Path.Combine(path, "web.config");
            var map = new ExeConfigurationFileMap();
            map.ExeConfigFilename = webConfig;
            var config = ConfigurationManager.OpenMappedExeConfiguration(map, ConfigurationUserLevel.None);
            var mailSettings = config.GetSectionGroup("system.net/mailSettings") as MailSettingsSectionGroup;
            from = mailSettings.Smtp.From;
            host = mailSettings.Smtp.Network.Host;// = "127.0.0.1";
            userName = mailSettings.Smtp.Network.UserName;// = null;
            password = mailSettings.Smtp.Network.Password;// = null;
            defaultCredentials = mailSettings.Smtp.Network.DefaultCredentials;// = true;
            port = mailSettings.Smtp.Network.Port;// = 25;
            enableSsl = mailSettings.Smtp.Network.EnableSsl;// = false;
            return;
        }
        private void SetMailSettings(MailSettingsSectionGroup mailSettings, string from, string host, string userName, string password, bool defaultCredentials, int port, bool enableSsl)
        {
            mailSettings.Smtp.From = from;
            mailSettings.Smtp.Network.Host = host;
            mailSettings.Smtp.Network.UserName = userName;
            mailSettings.Smtp.Network.Password = password;
            mailSettings.Smtp.Network.DefaultCredentials = defaultCredentials;
            mailSettings.Smtp.Network.Port = port;
            mailSettings.Smtp.Network.EnableSsl = enableSsl;
        }
    }
}
