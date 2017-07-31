using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Messaging
{
    public interface IMessageClient
    {
        Task messageReceived(MessageBase message);
    }
    public interface IMessageHubManager
    {

        MessageHub Hub { get; set; } 

        void AddClient(string connectionId);
        void RemoveClient(string connectionId);

        Task SendMessage(MessageBase message);

    }
}
