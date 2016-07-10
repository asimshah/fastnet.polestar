using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public enum SatelliteType
    {
        Live, // i.e in chicago
        Test, // i.e.  in weston
        Local, // i.e on small-box for local sites
        Development // i.e. on small-box for development (i.e in Visual Studio)
    }
}
