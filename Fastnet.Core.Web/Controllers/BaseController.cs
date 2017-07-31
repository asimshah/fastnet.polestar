using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

namespace Fastnet.Core.Web.Controllers
{
    public abstract class BaseController : Controller
    {
        public bool IsMobile { get; private set; }
        protected string userAgent;
        protected IHostingEnvironment env;
        protected BaseController(IHostingEnvironment env)
        {
            this.env = env;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            userAgent = Request?.UserAgent();
            IsMobile = Request != null ? Request.IsMobileBrowser() : false;
            ViewData["IsMobile"] = IsMobile;
            base.OnActionExecuting(context);
        }
        protected void EnsureCaching(DateTime lastModified)
        {
            if (!env.IsDevelopment())
            {
                var headers = Response.GetTypedHeaders();
                headers.LastModified = lastModified;
                headers.CacheControl = new CacheControlHeaderValue { Public = true };
            }
            else
            {
                EnsureNoCaching();
            }
        }
        protected void EnsureNoCaching()
        {
            var headers = Response.GetTypedHeaders();
            headers.CacheControl = new CacheControlHeaderValue { Public = false, NoCache = true };
        }
        protected ObjectResult SuccessResult(object data, string message = "")
        {
            dataResult dr = new dataResult { success = true, data = data, message = message };
            return new ObjectResult(dr);
        }
        protected ObjectResult ErrorResult(string exceptionMessage, string message = "")
        {
            dataResult dr = new dataResult { success = false, data = null, exceptionMessage = exceptionMessage, message = message };
            return new ObjectResult(dr);
        }
    }
}
