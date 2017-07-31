using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
// Important Notes
// 1. the template Repository needs to be set up as a singleton using the call
//      services.AddSingleton<ITemplateRepository, TemplateRepository>();
//    in ConfigureServices in Startup.cs
// 2. templates are html files containg html fragments. They need to be in subfolders of a templates folder, as in, for example:
//    wwwroot
//           /templates
//                     /pages
//                         home.html
//                         settings.html
//    templates such as the above are given names reflecting the folder hierarchy:
//       pages-home, pages-settings
// 3. there is a template.ts in fastnet.typescript that provides the script to call templates from script
//     see examples such as in apollo.ts
namespace Fastnet.Core.Web.Controllers
{
    [Route("template")]
    public class TemplateController : BaseController
    {
        
        public ITemplateRepository templateRepository { get; set; }
        public TemplateController(IHostingEnvironment env, [FromServices] ITemplateRepository tr) : base(env)
        {
            this.templateRepository = tr;
        }
        [HttpGet("get/{name}")]
        public IActionResult GetTemplate(string name)
        {
            Debug.Assert(templateRepository != null, "template repository not found, has the singleton been added in Startup.cs?");
            var template = templateRepository.GetTemplate(name);
            if (!string.IsNullOrWhiteSpace(template.Text))
            {
                EnsureCaching(template.LastModified);
                return SuccessResult(template.Text);
            }
            else
            {
                return ErrorResult("NotFound", $"Template {name} not found");
            }
        }
    }
}
