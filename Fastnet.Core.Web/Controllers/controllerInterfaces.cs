using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Controllers
{
    public interface ITemplate
    {
        string Text { get; }
        DateTime LastModified { get; }
    }
    public interface ITemplateRepository
    {
        //string GetTemplateFilename(string name, string area = "");
        //string GetTemplateText(string name, string area = "");
        ITemplate GetTemplate(string name, string area = "");
    }
}
