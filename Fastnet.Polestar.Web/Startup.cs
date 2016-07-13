using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;
using Fastnet.Core.Web.Controllers;
using Fastnet.Core.Web.Tasks;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Messaging;
using Microsoft.AspNetCore.Http;
using Fastnet.Polestar.Data;

namespace Fastnet.Polestar.Web
{
    public static class ProviderHelper
    {
        public static IServiceProvider ServiceProvider { get; set; }
    }
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var dataDirectory = Path.Combine(env.ContentRootPath, "data");
            if (!Directory.Exists(dataDirectory))
            {
                Directory.CreateDirectory(dataDirectory);
            }
            AppDomain.CurrentDomain.SetData("DataDirectory", Path.Combine(env.ContentRootPath, "data"));
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Configuration["Data:PolestarDb:ConnectionString"];
            // Add framework services.
            services.AddCors(cors => cors.AddPolicy("PolestarSatellites", builder => {
                builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            }));
            services.AddMvc(options => {
                options.Conventions.Add(new ComplexTypeFromBodyConvention());
            });
            services.AddScoped(p =>
            {
                return new DataContext(p, connectionString);
            });
#if SignalR
       services.AddSignalR(options =>
            {
                options.Hubs.EnableDetailedErrors = this.env.IsEnvironment("Development");

            });
#endif
            services.AddOptions();
            services.Configure<PolestarConfiguration>(Configuration.GetSection("PolestarConfiguration"));
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<ITemplateRepository, TemplateRepository>();
            //services.AddSingleton<IMessageHubManager, MessageHubManager>();
            services.AddScoped<ITaskManager, TaskManager>((sp) => {
                var tm = new TaskManager(sp, connectionString);
                return tm;
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(ITaskManager tm, IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            ProviderHelper.ServiceProvider = app.ApplicationServices; // this is supposed to be an "anti-pattern" - but how else can we get things like logger in classes that are not implemented as services
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug((text, level) => {
                switch(level)
                {
                    default:
                        return false;
                    case LogLevel.Information:
                    case LogLevel.Warning:
                    case LogLevel.Error:
                    case LogLevel.Critical:
                        return true;
                }
                //if(text.StartsWith("Microsoft"))
                //{
                //    return false;
                //}
                //if (text.Contains("NewMusicScanner"))
                //{
                //    return false;
                //}
                //return true;
            });
            loggerFactory.AddRollingFile(Configuration.GetSection("RollingFileLog"));
            var logger = loggerFactory.CreateLogger<Startup>();
            string dataDirectory = (string)AppDomain.CurrentDomain.GetData("DataDirectory");
            logger.LogInformation($"DataDirectory is {dataDirectory}");
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }
            //**NB** make sure the UseCors call is first!!!
            app.UseCors("PolestarSatellites");
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
           
            tm.Initialise();
//#if SignalR
//            app.UseWebSockets();
//            app.UseSignalR(); 
//#endif
        }
    }
}
