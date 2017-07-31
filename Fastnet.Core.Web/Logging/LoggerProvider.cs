using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Fastnet.Core.Web
{
    public abstract class LoggerProvider : ILoggerProvider
    {
        private IDictionary<string, ILogger> loggers = new Dictionary<string, ILogger>();
        protected readonly Func<string, LogLevel, bool> _filter;
        protected ConfigurationLogSettings _settings;
        public LoggerProvider(Func<string, LogLevel, bool> filter)
        {
            if (filter == null)
            {
                throw new ArgumentNullException(nameof(filter));
            }

            _filter = filter;
            _settings = null;// new LogSettings();
        }
        public LoggerProvider(ConfigurationLogSettings settings)
        {
            _settings = settings;
        }
        public ILogger CreateLogger(string categoryName)
        {
            if(categoryName.Contains(","))
            {
                categoryName = categoryName.Split(',')[0];
            }
            if (!loggers.ContainsKey(categoryName))
            {
                lock (loggers)
                {
                    if (!loggers.ContainsKey(categoryName))
                    {
                        //loggers[categoryName] = new Log4NetLogger(categoryName, _filter);
                        var filter = GetFilter(categoryName, _settings);
                        loggers[categoryName] = GetLoggerInstance(categoryName, filter);
                    }
                }
            }
            return loggers[categoryName];
        }
        protected abstract ILogger GetLoggerInstance(string name, Func<string, LogLevel, bool> filter);
        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).
                    loggers.Clear();
                    //loggers = null;
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~Log4NetProvider() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion
        private Func<string, LogLevel, bool> GetFilter(string name, ConfigurationLogSettings settings)
        {
            if (_filter != null)
            {
                return _filter;
            }

            if (settings != null)
            {
                foreach (var prefix in GetKeyPrefixes(name))
                {
                    //Debug.WriteLine($"Evaluating {prefix}");
                    LogLevel level = LogLevel.Information;
                    if (settings.TryGetSwitch(prefix, out level))
                    {
                        //Debug.WriteLine($"prefix {prefix} level {level}");
                        return (n, l) => l >= level;
                    }
                }
            }

            return (n, l) => false;
        }
        private IEnumerable<string> GetKeyPrefixes(string name)
        {
            while (!string.IsNullOrEmpty(name))
            {
                yield return name;
                var lastIndexOfDot = name.LastIndexOf('.');
                if (lastIndexOfDot == -1)
                {
                    yield return "Default";
                    break;
                }
                name = name.Substring(0, lastIndexOfDot);
            }
        }
    }
}
