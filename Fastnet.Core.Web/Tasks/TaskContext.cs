using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Fastnet.Core.Web.Tasks
{
    public class TaskContext : DbContext
    {
        private readonly ILogger<TaskContext> logger;
        //private readonly IHostingEnvironment env;
        public TaskContext(IServiceProvider sp, string cs) : base(cs)
        {
            this.logger = sp.GetService<ILogger<TaskContext>>();
        }
        //public TaskContext(IHostingEnvironment env, IServiceProvider sp) : base(GetConnectionString(env))
        //{
        //    this.logger = sp.GetService<ILogger<TaskContext>>();
        //    this.env = env;
        //}
        public DbSet<WebTask> Tasks { get; set; }
        public DbSet<TaskHistory> TaskHistory { get; set; }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("task");
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();
            modelBuilder.Properties<DateTime>().Configure(c => c.HasColumnType("datetime2"));
            base.OnModelCreating(modelBuilder);
            logger?.LogInformation("Task database created");
        }
    }
}
