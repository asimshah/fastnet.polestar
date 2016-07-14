using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class uploadInfo
    {
        public satellite satellite { get; set; }
        public bool isPolestarUpload { get; set; }
        public string key { get; set; }
        public string filename { get; set; }
        public long length { get; set; }
        public int chunkSize { get; set; }
        public long totalChunks { get; set; }
        public long chunkNumber { get; set; }
    }
}
