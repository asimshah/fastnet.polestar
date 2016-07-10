using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class PolestarLocations
    {
        public string PolestarSourceFolder { get; set; }
        public string PolestarDestinationFolder { get; set; }
        public string DistributionFolder { get; set; }
        public string PublishingFolder { get; set; }
        public string WebframeMarkerDll { get; set; }
    }
    public class PolestarConfiguration
    {
        public int FileTransferBufferLength { get; set; } // actual length = n * 1024
        public PolestarLocations defaultLocations { get; set;}
        public satellite[] Satellites { get; set; }
    }
}
