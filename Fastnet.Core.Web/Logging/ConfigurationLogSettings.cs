using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web
{
    public class ConfigurationLogSettings //: ILogSettings
    {
        private readonly IConfiguration _configuration;
        //public IDictionary<string, LogLevel> Switches { get; set; } = new Dictionary<string, LogLevel>();
        //private IConfigurationSection switches;
        public ConfigurationLogSettings(IConfiguration config)
        {
            this._configuration = config;
            //this.switches = _configuration?.GetSection("LogLevel");
        }

        public bool TryGetSwitch(string name, out LogLevel level)
        {
            var switches = _configuration?.GetSection("LogLevel");
            if (switches == null)
            {
                level = LogLevel.Information;
                return true;
            }
            var value = switches[name];
            if (string.IsNullOrEmpty(value))
            {
                level = LogLevel.None;
                return false;
            }
            else if (Enum.TryParse<LogLevel>(value, out level))
            {
                return true;
            }
            else
            {
                var message = $"Configuration value '{value}' for category '{name}' is not supported.";
                throw new InvalidOperationException(message);
            }
        }
    }
}
