using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Fastnet.Polestar.Data
{
    // This project can output the Class library as a NuGet Package.
    // To enable this option, right-click on the project and select the Properties menu item. In the Build tab select "Produce outputs on build".
    public class DataContext :  DbContext
    {
        private readonly ILogger<DataContext> logger;
        //private readonly IHostingEnvironment env;
        public DbSet<FileTransfer> FileTransfers { get; set; }
        public DbSet<FileChunk> FileChunks { get; set; }
        public DataContext(IServiceProvider sp, string cs): base(cs)
        {
            this.logger = sp.GetService<ILogger<DataContext>>();
        }
        //public DataContext(IHostingEnvironment env, ILogger<DataContext> logger, IServiceProvider sp) : base(GetConnectionString(env, logger))
        //{
        //    this.logger = logger != null ? logger : sp.GetService<ILogger<DataContext>>();
        //    this.env = env;
        //}
        public static void SetInitialiser()
        {
            Database.SetInitializer(new DatabaseInitialiser());
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("std");
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Remove<ManyToManyCascadeDeleteConvention>();
            modelBuilder.Properties<DateTime>().Configure(c => c.HasColumnType("datetime2"));
            base.OnModelCreating(modelBuilder);
            logger.LogInformation("Polestar database created");
        }

        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    string basepath = this.env.ApplicationBasePath;
        //    string dbFilename = Path.Combine(basepath, "wwwroot", "data", "polaris2.mdf");
        //    var cb = new SqlConnectionStringBuilder();
        //    cb.DataSource = @".\sqlexpress";
        //    //cb.DataSource = @"(localdb)\mssqllocaldb";
        //    cb.InitialCatalog = "Polaris2";
        //    //Console.WriteLine(dbFilename);
        //    cb.AttachDBFilename = dbFilename;
        //    cb.MultipleActiveResultSets = true;
        //    cb.IntegratedSecurity = true;
        //    logger.LogInformation($"Polaris connectionstring is {cb.ToString()}");
        //    optionsBuilder.UseSqlServer(cb.ToString());
        //    base.OnConfiguring(optionsBuilder);
        //}

        //private static string GetConnectionString(IHostingEnvironment env, ILogger<DataContext> logger)
        //{
        //    string dataFolder = env.MapPath("data");
        //    if(!Directory.Exists(dataFolder))
        //    {
        //        Directory.CreateDirectory(dataFolder);
        //        logger.LogInformation($"{dataFolder} created");
        //    }
        //    string dbFilename = System.IO.Path.Combine(dataFolder, "polestar.mdf");
        //    var cb = new SqlConnectionStringBuilder();
        //    cb.DataSource = @".\sqlexpress";
        //    cb.AttachDBFilename = dbFilename;
        //    cb.MultipleActiveResultSets = true;
        //    cb.IntegratedSecurity = true;
        //    logger.LogVerbose($"Polestar connectionstring is {cb.ToString()}");
        //    return cb.ToString();
        //}
    }
    internal class DatabaseInitialiser : DropCreateDatabaseIfModelChanges<DataContext>
    {

    }
}
