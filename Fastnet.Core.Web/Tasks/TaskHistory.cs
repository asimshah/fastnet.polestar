using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public class TaskHistory //: ITaskHistory
    {
        public long Id { get; set; }
        public virtual WebTask Task { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }
        public TaskStatus Status { get; set; }
        [MaxLength(512)]
        public string Remark { get; set; }
    }
}
