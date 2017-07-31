using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Controllers
{
    // **NB** this class is also available in Typescript for client-side use. q.v. ajax.ts in Fastnet.Typescript
    // this is the standard method to send data to the client with result information
    public class dataResult
    {
        public bool success { get; set; }
        public string message { get; set; }
        public string exceptionMessage { get; set; }
        public object data { get; set; }
    }
}
