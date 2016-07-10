using Fastnet.Core.Web;
using System.Data.Entity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core.Web.Tasks;

namespace Fastnet.Polestar.Web
{

    public class EmptyTask : ITask
    {
        public async Task<Core.Web.Tasks.TaskResult> Execute(ILogger logger, params object[] args)
        {
            //this.logger = logger;
            logger.LogInformation("Starting empty task");
            await Task.Delay(2000);
            return new Core.Web.Tasks.TaskResult { Success = true, CompletionRemark = $"Task run for 2000 millisecs" };
        }
        public string GetId()
        {
            return this.GetType().FullName;
        }
    }
}
