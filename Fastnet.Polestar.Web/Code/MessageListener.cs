namespace Fastnet.Polestar
{
    //public class DebugTextWriter : TextWriter
    //{
    //    public override void WriteLine(string value)
    //    {
    //        Debug.WriteLine(value);
    //    }

    //    public override void WriteLine(object value)
    //    {
    //        Debug.WriteLine(value);
    //    }

    //    public override void WriteLine(string format, params object[] arg)
    //    {
    //        Debug.WriteLine(format, arg);
    //    }

    //    public override Encoding Encoding
    //    {
    //        get { return Encoding.UTF8; }
    //    }
    //}
    //public class MessageListener : IDisposable
    //{
    //    private HubConnection connection;
    //    private IHubProxy hubProxy { get; set; }
    //    public async Task Connect(string url, Action<MessageBase> messageHandler)
    //    {
    //        try
    //        {
    //            connection = new HubConnection(url);
    //            connection.TraceLevel = TraceLevels.All;
    //            connection.TraceWriter = new DebugTextWriter();
    //            hubProxy = connection.CreateHubProxy("MessageHub");
    //            await connection.Start();
    //            hubProxy.On<zipProgress>("messageReceived", mb => { this.handleMessage(mb); });


    //        }
    //        catch (Exception xe)
    //        {
    //            Debugger.Break();
    //            throw;
    //        }
    //    }

    //    public void Dispose()
    //    {            
    //        connection.Stop();
    //    }

    //    private void handleMessage(zipProgress mb)
    //    {
    //        Debug.WriteLine($"received message {mb.messageType}");
    //    }
    //}
}
