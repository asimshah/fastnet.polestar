using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class satelliteInformation
    {
        public string machine { get; set; }
        public bool webframeIsUploaded { get; set; }
        public version uploadedWebframeVersion { get; set; }
    }
}
