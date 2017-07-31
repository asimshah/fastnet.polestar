using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Messaging
{
    public class MessageBase
    {
        public string messageType { get; private set; }
        public string typeName { get; private set; }
        public DateTime dateTimeUtc { get; private set; }
        public MessageBase()
        {
            this.messageType = this.GetType().Name;
            this.typeName = this.GetType().FullName;
            this.dateTimeUtc = DateTime.UtcNow;
        }
    }
}
