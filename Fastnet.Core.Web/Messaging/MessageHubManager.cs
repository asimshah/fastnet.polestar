using Fastnet.Core.Web.Messaging;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Messaging
{
    public class MessageHubManager : IMessageHubManager
    {
        private class ClientProxy
        {
            public string ConnectionId { get; set; }
        }
        private readonly ILogger<MessageHubManager> logger;
        private Dictionary<string, ClientProxy> clients = new Dictionary<string, ClientProxy>();
        public MessageHub Hub { get; set; }
        public MessageHubManager(ILogger<MessageHubManager> logger /*, ITaskManager taskManager */)
        {
            this.logger = logger;
        }
        public void AddClient(string connectionId)
        {
            if (!clients.ContainsKey(connectionId))
            {
                ClientProxy ac = new ClientProxy { ConnectionId = connectionId };
                clients.Add(connectionId, ac);
                logger.LogInformation($"connection {connectionId} registered");
            }
        }

        public void RemoveClient(string connectionId)
        {
            if (clients.ContainsKey(connectionId))
            {
                clients.Remove(connectionId);
                logger.LogInformation($"connection {connectionId} unregistered");
            }
        }
        public async Task SendMessage(MessageBase message)
        {
#if SignalR
        public async Task SendMessage(MessageBase message)
        {
            Debug.Assert(this.Hub != null);

            await this.Hub.Clients.All.messageReceived(message); 
#else
            await Task.Delay(0);
#endif
        }
        public void ListClients()
        {
            foreach (var entry in clients)
            {
                Debug.WriteLine($"{entry.Key}");
            }
        }
    }
}
