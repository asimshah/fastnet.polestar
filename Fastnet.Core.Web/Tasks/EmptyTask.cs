using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Tasks
{
    public class EmptyTask : ITask
    {
        public async Task<TaskResult> Execute(ILogger logger, params object[] args)
        {
            //this.logger = logger;
            logger.LogInformation("Starting empty task");
            await Task.Delay(2000);
            return new TaskResult { Success = true, CompletionRemark = $"Task run for 2000 millisecs" };
        }

        public string GetId()
        {
            return this.GetType().FullName;
        }
    }
}
