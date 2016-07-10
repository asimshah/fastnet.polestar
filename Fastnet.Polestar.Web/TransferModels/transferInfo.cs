using Fastnet.Core.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core.Web.Messaging;

namespace Fastnet.Polestar.Web
{
    public class TransferInfo : MessageBase
    {
        public string key { get; set; }
        public string filename { get; set; }
        public long length { get; set; }
        public int chunkSize { get; set; }
        public long totalChunks { get; set; }
        public long chunkNumber { get; set; }
    }
}
