using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading;

namespace Fastnet.Core.Web
{
    public class RollingFileLoggerSettings : ConfigurationLogSettings
    {
        public readonly string logFolder;
        public RollingFileLoggerSettings(IConfiguration config) : base(config)
        {
            this.logFolder = config?["LogFolder"] ?? "logs";
        }
    }
    public class RollingFileLoggerProvider : LoggerProvider
    {
        public RollingFileLoggerProvider(RollingFileLoggerSettings settings) : base(settings)
        {
        }

        public RollingFileLoggerProvider(Func<string, LogLevel, bool> filter) : base(filter)
        {
        }
        protected override ILogger GetLoggerInstance(string name, Func<string, LogLevel, bool> filter)
        {
            return new RollingFileLogger(name, filter, this._settings as RollingFileLoggerSettings);
        }
    }
    public class RollingFileLogger : LoggerBase
    {
        //private static object _lock = new object();
        //private static bool started = false;
        private FileWriter fw;
        public RollingFileLogger(string loggerName, Func<string, LogLevel, bool> filter, RollingFileLoggerSettings settings) : base(loggerName, filter, settings)
        {
            fw = FileWriter.Get(settings);
            //Debug.WriteLine($"RollingFileLogger: instance started for {loggerName}");
        }
        protected override void WriteMessage(LogLevel logLevel, string name, string message, Exception exception)
        {
            fw.WriteMessage(logLevel, name, Thread.CurrentThread.ManagedThreadId, message, exception);
        }
    }
    public static class RollingFileLoggerExtensions
    {
        public static ILoggerFactory AddRollingFile(this ILoggerFactory loggerFactory)
        {
            var settings = new RollingFileLoggerSettings(null);
            return loggerFactory.AddRollingFile(settings);
        }
        public static ILoggerFactory AddRollingFile(this ILoggerFactory loggerFactory, IConfiguration config)
        {
            var settings = new RollingFileLoggerSettings(config);
            return loggerFactory.AddRollingFile(settings);
        }
        public static ILoggerFactory AddRollingFile(this ILoggerFactory loggerFactory, RollingFileLoggerSettings settings)
        {
            loggerFactory.AddProvider(new RollingFileLoggerProvider(settings));
            return loggerFactory;
        }
        public static ILoggerFactory AddRollingFile(this ILoggerFactory loggerFactory, Func<string, LogLevel, bool> filter)
        {
            loggerFactory.AddProvider(new RollingFileLoggerProvider(filter));
            return loggerFactory;
        }
    }
    internal class FileWriter
    {
        private static object _lock = new object();
        private static FileWriter fw;
        private BlockingCollection<string> messageQueue;
        private StreamWriter writer;
        private string logFilename;
        private DateTime today;
        private RollingFileLoggerSettings settings;
        internal static FileWriter Get(RollingFileLoggerSettings settings)
        {
            if (fw == null)
            {
                lock (_lock)
                {
                    if (fw == null)
                    {
                        fw = new FileWriter(settings);
                        fw.Initialise();
                    }
                }
            }
            return fw;
        }
        private FileWriter(RollingFileLoggerSettings settings)
        {
            this.settings = settings;
        }
        public void WriteMessage(LogLevel logLevel, string name, int threadId, string message, Exception exception)
        {
            var level = logLevel.ToString().Substring(0, 4).ToUpper();
            var now = DateTime.Now;
            var text = $"{now:ddMMMyyyy HH:mm:ss} [{threadId:000}] [{name}] {level} {message}";
            messageQueue.Add(text);
            WriteException(exception);
        }

        private void WriteException(Exception exception)
        {
            var xe = exception;
            while (xe != null)
            {

                var text = $"   Exception: {xe.Message}: {xe.StackTrace}";
                messageQueue.Add(text);
                xe = xe.InnerException;
            }
        }

        private void Initialise()
        {
            messageQueue = new BlockingCollection<string>();
            StartQueueService();
        }
        private void StartQueueService()
        {
            Task.Run(async () =>
            {
                while (!messageQueue.IsCompleted)
                {
                    try
                    {
                        await EnsureValidLogFile();
                        foreach(string t in messageQueue.GetConsumingEnumerable())
                        {
                            //Debug.WriteLine("messageQueue.GetConsumingEnumerable");
                            await writer.WriteLineAsync(t);
                            await writer.FlushAsync();
                        }
                        //string text;
                        //if (messageQueue.TryTake(out text))
                        //{
                        //    Debug.WriteLine("messageQueue.TryTake(out text)");
                        //    await writer.WriteLineAsync(text);
                        //    await writer.FlushAsync();
                        //}
                        //Debug.WriteLine("messageQueue.IsComplete");
                    }
                    catch (Exception xe)
                    {
                        Debug.WriteLine($"RollingFileLogger failed: {xe.Message}");
                        //Debugger.Break();
                        throw;
                    }
                }
            });
        }
        private void EnsureValidLogFileOld()
        {
            var settings = (RollingFileLoggerSettings)this.settings;
            if (writer == null || today != DateTime.Today)
            {
                lock (_lock)
                {
                    if (writer == null || today != DateTime.Today)
                    {
                        if (!Directory.Exists(settings.logFolder))
                        {
                            Directory.CreateDirectory(settings.logFolder);
                        }
                        if (writer != null)
                        {
                            writer.Flush();
                            writer.Dispose();
                        }
                        today = DateTime.Today;
                        logFilename = $"{today.Year}-{today.Month:00}-{today.Day:00}.log";
                        var fullPath = Path.Combine(settings.logFolder, logFilename);
                        var stream = File.Open(fullPath, FileMode.Append, FileAccess.Write, FileShare.Read);
                        writer = new StreamWriter(stream);
                    }
                }
            }
        }
        private async Task EnsureValidLogFile()
        {
            var settings = (RollingFileLoggerSettings)this.settings;
            if (writer == null || today != DateTime.Today)
            {
                using (SemaphoreSlim flag = new SemaphoreSlim(1))
                {
                    await flag.WaitAsync();
                    try
                    {
                        if (writer == null || today != DateTime.Today)
                        {
                            if (!Directory.Exists(settings.logFolder))
                            {
                                Directory.CreateDirectory(settings.logFolder);
                            }
                            if (writer != null)
                            {
                                writer.Flush();
                                writer.Dispose();
                            }
                            today = DateTime.Today;
                            logFilename = $"{today.Year}-{today.Month:00}-{today.Day:00}.log";
                            var fullPath = Path.Combine(settings.logFolder, logFilename);
                            var stream = File.Open(fullPath, FileMode.Append, FileAccess.Write, FileShare.Read);
                            writer = new StreamWriter(stream);
                        }
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                }
            }
        }
    }
}

