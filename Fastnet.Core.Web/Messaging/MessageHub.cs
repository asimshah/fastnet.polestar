using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// To use this MessageHub in an asp net core web site
// 1. ensure there are calls in startup configure()
//      app.UseWebSockets();
//      app.UseSignalR();
// 2. in startup configure services as follows
//      services.AddSignalR(options =>
//      {
//            options.Hubs.EnableDetailedErrors = this.env.IsEnvironment("Development");
//      });
//   and 
//      services.AddSingleton<IMessageHubManager, MessageHubManager>();
//  3. Add a script tage to the html
//      <script src="~/signalr/hubs" type="text/javascript"></script>
//  4. inject IMessageHubManager as required
//  5. typescript code for the client end can be found in fastnet typescript packages
namespace Fastnet.Core.Web.Messaging
{
#if SignalR
    public class MessageHub : Hub<IMessageClient>
    {
        private readonly ILogger<MessageHub> logger;
        protected readonly IMessageHubManager hubManager;
        public MessageHub(IMessageHubManager hm, ILogger<MessageHub> logger, IHttpContextAccessor hca)
        {
            //Debugger.Break();
            this.logger = logger;
            this.hubManager = hm;
            this.hubManager.Hub = this;
        }

        public override Task OnConnected()
        {
            var connectionId = this.Context.ConnectionId;
            logger.LogInformation($"OnConnected(): {connectionId} ");
            hubManager.AddClient(connectionId);
            return base.OnConnected();
        }
        public override Task OnDisconnected(bool stopCalled)
        {
            logger.LogInformation($"OnDisconnected(): {this.Context.ConnectionId} ");
            hubManager.RemoveClient(this.Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }
        public override Task OnReconnected()
        {
            var connectionId = this.Context.ConnectionId;
            logger.LogInformation($"OnReconnected(): {connectionId} ");
            hubManager.AddClient(connectionId);
            return base.OnReconnected();
        }
    } 
#else
    public class MessageHub 
    {
    }
#endif
    }
