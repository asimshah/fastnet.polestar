using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class version : IComparable<version>
    {
        public int major { get; set; }
        public int minor { get; set; }
        public int revision { get; set; }
        public int build { get; set; }

        public int CompareTo(version other)
        {
            if (this.major != other.major)
            {
                return this.major.CompareTo(other.major);
            }
            else if (this.minor != other.minor)
            {
                return this.minor.CompareTo(other.minor);
            }
            else if (this.build != other.build)
            {
                return this.build.CompareTo(other.build);
            }
            else if (this.revision != other.revision)
            {
                return this.revision.CompareTo(other.revision);
            }

            return 0;
        }
        public static bool operator >(version v1, version v2)
        {
            return v1.CompareTo(v2) > 0;
        }
        public static bool operator <(version v1, version v2)
        {
            return v1.CompareTo(v2) < 0;
        }
    }
}
