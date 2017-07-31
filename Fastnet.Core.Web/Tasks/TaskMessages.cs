using Fastnet.Core.Web.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public class taskStarted : MessageBase
    {
        public string name { get; set; }
        public DateTime startedAt { get; private set; }
        public taskStarted(string name, DateTime startedAt)
        {
            this.name = name;
            this.startedAt = startedAt;
        }
    }
    public class taskFinished : MessageBase
    {
        public string name { get; set; }
        public DateTime finishedAt { get; private set; }
        public string completionRemark { get; private set; }
        public taskFinished(string name, DateTime finishedAt, string completionRemark)
        {
            this.name = name;
            this.finishedAt = finishedAt;
            this.completionRemark = completionRemark;
        }
    }
}
