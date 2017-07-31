using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public class WebTask
    {
        private ICollection<TaskHistory> history;
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        [MaxLength(512)]
        public string TaskId { get; set; }
        [MaxLength(128)]
        public string Name { get; internal set; }
        public TaskStatus Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
        [MaxLength(255)]
        public string CompletionRemark { get; set; }
        public virtual ICollection<TaskHistory> History
        {
            get { return history ?? (history = new HashSet<TaskHistory>()); }
            set { history = value; }
        }
    }
}
