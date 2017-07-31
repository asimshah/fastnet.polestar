using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public class TaskResult
    {
        public bool IsRunning { get; set; }
        public bool Success { get; set; }
        public Exception Exception { get; set; }
        public object User { get; set; }
        public string CompletionRemark { get; set; }
    }
}
