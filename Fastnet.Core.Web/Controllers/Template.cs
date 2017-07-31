using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Controllers
{
    public class Template : ITemplate
    {
        public string Text { get; private set; }
        public DateTime LastModified { get; private set; }
        public Template(string text, DateTime lastModified)
        {
            this.Text = text;
            this.LastModified = lastModified;
        }
    }
}
