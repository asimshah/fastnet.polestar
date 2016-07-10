using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{

    public class site
    {
        public string name { get; set; }
        public string host { get; set; }
        public int port { get; set; }
        public string path { get; set; }
        public string poolName { get; set; }
        public string[] databaseNames { get; set; }
        public bool isWebframe { get; set; }
        public bool isPaused { get; set; }
        public bool isUpgradeable { get; set; }
        public version version { get; set; }
    }
}
