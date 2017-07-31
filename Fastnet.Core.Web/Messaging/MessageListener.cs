using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Messaging
{
    internal class DebugTextWriter : TextWriter
    {
        public override void WriteLine(string value)
        {
            Debug.WriteLine(value);
        }

        public override void WriteLine(object value)
        {
            Debug.WriteLine(value);
        }

        public override void WriteLine(string format, params object[] arg)
        {
            Debug.WriteLine(format, arg);
        }

        public override Encoding Encoding
        {
            get { return Encoding.UTF8; }
        }
    }
#if SignalR
    public class MessageListener : IDisposable
    {
        private string[] exclusions = new string[] { "System", "Microsoft", "mscorlib", "EntityFramework", "Newtonsoft", "log4net" };
        private Assembly[] assemblies;
        private HubConnection connection;
        private IHubProxy hubProxy { get; set; }
        private readonly bool trace;
        private Dictionary<Type, Action<object>> handlers;
        public MessageListener(string url, bool trace2debug = false)
        {
            this.assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(x => exclusions.All(z => x.FullName.StartsWith(z) == false)).ToArray();
            handlers = new Dictionary<Type, Action<object>>();
            this.trace = trace2debug;
            connection = new HubConnection(url);
            if (trace)
            {
                connection.TraceLevel = TraceLevels.All;
                connection.TraceWriter = new DebugTextWriter();
            }
            hubProxy = connection.CreateHubProxy("MessageHub");
            hubProxy.On("messageReceived", mb => { handleMessage(mb); });
        }
        public async Task Start()
        {
            await connection.Start();
        }
        public void AddHandler<T>(Action<T> action) where T : MessageBase
        {
            handlers.Add(typeof(T), o => action((T)o));
        }
        public void Dispose()
        {
            connection.Stop();
        }
        private void handleMessage(dynamic mb)
        {
            string typeName = mb.typeName;
            //Debug.WriteLine(typeName);
            Type t = assemblies.SelectMany(a => a.GetTypes()).Single(x => x.FullName == typeName);// Type.GetType(typeName);
            var message = Newtonsoft.Json.JsonConvert.DeserializeObject(mb.ToString(), t);
            //Debug.WriteLine($"message if of type {message.GetType().FullName}");
            if (handlers.ContainsKey(message.GetType()))
            {
                handlers[message.GetType()](message);
            }
        }
    }
}
#else
    public class MessageListener : IDisposable
    {
        public MessageListener(string url, bool trace2debug = false)
        {
        }
        public async Task Start()
        {
            await Task.Delay(0);
        }
        public void AddHandler<T>(Action<T> action) where T : MessageBase
        {
            
        }
        public void Dispose()
        {
            
        }
    }
#endif
}