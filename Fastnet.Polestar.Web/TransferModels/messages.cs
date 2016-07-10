using Fastnet.Core.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core.Web.Messaging;

namespace Fastnet.Polestar.Web
{
    public class zipProgress : MessageBase
    {
        //private static int count;
        public string direction { get; set; }
        public int grossTotal { get; set; }
        public int completed { get; set; }
        public zipProgress()
        {

        }
        public override string ToString()
        {
            return $"{direction} {completed}/{grossTotal}";
        }
    }
    public class ZipError : MessageBase
    {
        public string FileName { get; set; }
        public string Error { get; set; }
        public ZipError()
        {

        }
    }
    public class zipFinished : MessageBase
    {
        public override string ToString()
        {
            return "zip finished";
        }
    }
    public class unZipFinished : MessageBase
    {
        public override string ToString()
        {
            return "unzip finished";
        }
    }
    public class uploadFinished : MessageBase
    {

    }
}
