using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web
{

    public abstract class LoggerBase : ILogger
    {
        protected readonly ConfigurationLogSettings _settings;
        private Func<string, LogLevel, bool> _filter;
        public string Name { get; private set; }
        //public IDisposable BeginScope(object state)
        //{
        //    return null;
        //}

        public LoggerBase(string loggerName, Func<string, LogLevel, bool> filter, ConfigurationLogSettings settings)
        {
            Name = loggerName;
            _filter = filter;
            _settings = settings;
        }
        protected internal Func<string, LogLevel, bool> Filter
        {
            get { return _filter; }
            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException(nameof(value));
                }

                _filter = value;
            }
        }
        public bool IsEnabled(LogLevel logLevel)
        {
            if (Filter(Name, logLevel))
            {
                return IsLevelEnabled(logLevel);
            }
            else
            {
                return false;
            }
        }
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                //Debug.Print($"** {state} dropped");
                return;
            }
            if (formatter == null)
            {
                throw new ArgumentNullException(nameof(formatter));
            }
            string message = formatter(state, exception);
            if(string.IsNullOrEmpty(message))
            {
                return;
            }
            WriteMessage(logLevel, Name, message, exception);
        }
        //public void Log(LogLevel logLevel, int eventId, object state, Exception exception, Func<object, Exception, string> formatter)
        //{
        //    if (!IsEnabled(logLevel))
        //    {
        //        //Debug.Print($"** {state} dropped");
        //        return;
        //    }
        //    string message = null;
        //    if (null != formatter)
        //    {
        //        message = formatter(state, exception);
        //    }
        //    else
        //    {
        //        //message = LogFormatter.Formatter(state, exception);
        //    }
        //    if (_settings.Redirect2Debug)
        //    {
        //        Debug.WriteLine($"{logLevel.ToString().Substring(0, 4).ToUpper()} [{Name}] {message}");
        //    }
        //    else
        //    {
        //        WriteMessage(logLevel, Name, message, exception);
        //    }
        //}

        protected virtual bool IsLevelEnabled(LogLevel level)
        {
            return true;
        }
        protected virtual void WriteMessage(LogLevel logLevel, string name, string message, Exception exception)
        {
            Debug.WriteLine($"WriteMessage needs overriding, {logLevel}, [{name}] {message}");
        }
        protected void LogExceptionStack(Exception xe)
        {
            //logger.Error(xe.Message, xe);
            Log(LogLevel.Error, 0, xe.StackTrace, null, null);
            //if (xe?.InnerException != null)
            //{
            //    LogExceptionStack(xe.InnerException);
            //}
        }



        public IDisposable BeginScope<TState>(TState state)
        {
            return null;
        }
    }
}
