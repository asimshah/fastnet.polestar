using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Fastnet.Core.Web.Controllers;
using Fastnet.Core.Web.Messaging;
using Fastnet.Core.Web.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace Fastnet.Polestar.Web.Controllers
{
    [Route("")]
    [Route("cmd")]
    public partial class HomeController : BaseController
    {
        private readonly Microsoft.Extensions.Logging.ILogger<HomeController> logger;
        private readonly string machine;
        private readonly bool isDebuggerAttached;
        private satellite currentSatellite;
        public satellite[] Satellites { get; set; }
        private readonly PolestarConfiguration config;
        private readonly Data.DataContext polestarData;
        private readonly IMessageHubManager messageHub;
        private readonly ITaskManager taskManager;
        private string siteurl;
        public HomeController(IHttpContextAccessor hca, Microsoft.AspNetCore.Hosting.IHostingEnvironment env,
            Microsoft.Extensions.Options.IOptions<PolestarConfiguration> polestarConfig, Microsoft.Extensions.Logging.ILogger<HomeController> logger,
            Data.DataContext ctx, IMessageHubManager messageHub, ITaskManager tm) : base(env)
        {
            this.logger = logger;
            this.messageHub = messageHub;
            this.taskManager = tm;
            this.isDebuggerAttached = System.Diagnostics.Debugger.IsAttached;
            this.machine = Environment.MachineName.ToLower();
            if (hca.HttpContext.Request.Method == "DEBUG")
            {
                logger.LogWarning("Request method is DEBUG, current site initialisation will fail");
            }
            SetSiteUrl(hca);
            config = polestarConfig.Value;
            this.Satellites = config.Satellites.ToArray();
            SetCurrentSatellite();
            this.polestarData = ctx;
            logger.LogTrace($"ctor(): Satellite {this.currentSatellite?.name},  webframe folders are on {this.currentSatellite?.webframeRootDrive}");

        }
        public IActionResult Index()
        {
            ViewData["Title"] = $"Polestar - {this.currentSatellite?.name}";
            return View();
        }
        [HttpGet]
        [Route("satellite/current")]
        public IActionResult GetSatelliteInformation()
        {
            return this.currentSatellite == null ? ErrorResult("Current Satellite not available") : SuccessResult(this.currentSatellite);
        }
        [HttpGet]
        [Route("satellite/list")]
        public IActionResult GetSatellites()
        {
            return SuccessResult(this.Satellites.Where(x => x.active).OrderBy(x => x.name));
        }
        [HttpPost]
        [Route("create/site")]
        public async Task<IActionResult> CreateSite(newSite ns)
        {
            WebframeHelper wh = new WebframeHelper(this.currentSatellite);
            await wh.CreateNewSite(ns);
            return SuccessResult(null);
        }
        [HttpGet]
        [Route("delete/site/{siteName}")]
        public async Task<IActionResult> DeleteSite(string siteName)
        {
            if (currentSatellite == null)
            {
                logger.LogWarning($"currentSatellite is null");
            }
            else if (string.IsNullOrWhiteSpace(currentSatellite.webframeMarkerDll))
            {
                logger.LogWarning($"webframeMarkerDll is null/white/empty");
            }
            WebframeHelper wh = new WebframeHelper(this.currentSatellite);
            await wh.DeleteSite(siteName);
            return SuccessResult(null);
        }
        [HttpGet]
        [Route("backup/site/{siteName}")]
        public async Task<IActionResult> BackupSite(string siteName)
        {
            var bh = new BackupHelper(this.taskManager, this.currentSatellite);
            await bh.BackupSite(siteName);
            logger.LogDebug("returning from backup/site");
            return SuccessResult(null);
        }
        [HttpGet]
        [Route("upgrade/site/{siteName}")]
        public async Task<IActionResult> UpgradeSite(string siteName)
        {
            WebframeHelper wh = new WebframeHelper(this.currentSatellite);
            await wh.UpgradeSite(siteName);
            return SuccessResult(null);
        }
        #region upload receiving methods
        //[HttpGet]
        //[Route("archive/finalise/{key}/{sourceSatellite}")]
        //public async Task<IActionResult> FinaliseArchive(string key, string sourceSatellite)
        //{
        //    string archiveFolder = this.currentSatellite.webframeArchiveFolder;
        //    archiveFolder = Path.Combine(archiveFolder, sourceSatellite);
        //    if (!Directory.Exists(archiveFolder))
        //    {
        //        Directory.CreateDirectory(archiveFolder);
        //        logger.LogInformation($"{archiveFolder} created");
        //    }
        //    var th = new TransferHelper();
        //    await th.ReassembleFile(key, archiveFolder);
        //    await RemoveFileUpload(key);
        //    return SuccessResult(null);
        //}
        #endregion

        [HttpGet("polestardeployment/start")]
        //[Route("polestardeployment/start")]
        public IActionResult DeployPolestar(string url)
        {
            var sourceFolder = currentSatellite.polestarSourceFolder;
            var zipFile = System.IO.Directory.EnumerateFiles(sourceFolder, "*.zip").OrderBy(x => new FileInfo(x).CreationTime).Last();
            logger.LogInformation($"cmd: upload {zipFile} to {url}");
            var target = this.Satellites.SingleOrDefault(x => string.Compare(x.url, url, true) == 0);
            Task.Run(async () =>
            {
                await UploadPolestarToSatellite(target, zipFile);
            });
            return SuccessResult(null);
        }
        [HttpGet("webframedeployment/start")]
        //[Route("webframedeployment/start")]
        public IActionResult DeployWebframe(string url)
        {
            if (this.currentSatellite?.latestAvailableWebframeVersion > new version())
            {
                var target = this.Satellites.SingleOrDefault(x => string.Compare(x.url, url, true) == 0);
                Task.Run(() => UploadWebframeTosatellite(target));
                return SuccessResult(null);
            }
            else
            {
                return ErrorResult("No version of webframe is available");
            }
        }
        [HttpGet]
        [Route("poll")]
        public void Poll()
        {
            //DateTime time = DateTime.Now;
            logger.LogTrace("Poll received");
            CreateRequiredBackupTasks();
            CreateRequiredArchiveTasks();
        }
        private void GetLatestAvailableWebframeVersion()
        {

        }
        private void SetCurrentSatellite()
        {
            //Debugger.Break();
            //this.currentSatellite = this.Satellites.Single(x => string.Compare(x.name, GetLocalSatelliteName(), true) == 0);
            this.currentSatellite = this.Satellites.SingleOrDefault(x => string.Compare(x.url, this.siteurl, true) == 0);
            if (currentSatellite == null)
            {
                logger.LogWarning($"Cannot find a satellite for {this.siteurl}");
            }
            else
            {
                this.currentSatellite.FillLocalInformation(config);
            }

        }
        private void SetSiteUrl(IHttpContextAccessor hca)
        {
            if (hca.HttpContext.Request.Method != "DEBUG")
            {
                this.siteurl = $"{hca.HttpContext.Request.Scheme}://{hca.HttpContext.Request.Host}";
                logger.LogTrace($"siteurl is {this.siteurl}");
            }
        }
        private string GetLocalSatelliteName()
        {
            switch (machine)
            {
                case "black-box":
                case "small-box":
                case "tablet":
                    return isDebuggerAttached ? "Local Development" : "Local Test";
                case "tin":
                case "lion":
                    return "Webframe Test";
                case "cherry":
                default:
                    return "Webframe Live";
            }
        }
        private void ExtractUploadedFile(string uploadkey, string target)
        {
            logger.LogInformation($"ExtractUploadedFile(): key {uploadkey} to {target}");
            byte[] data = null;
            Guid guid = Guid.Parse(uploadkey);
            Data.FileTransfer fu = polestarData.FileTransfers.SingleOrDefault(x => x.Id == guid);
            if (fu != null)
            {
                var th = new TransferHelper();
                data = th.GetBytes(fu);
                System.IO.MemoryStream ms = new System.IO.MemoryStream(data);
                FolderCompression fc = new FolderCompression();
                fc.DestinationFolder = target;
                EmptyDistribution();
                //Log.Write("unzip starting to {0}", fc.DestinationFolder);
                fc.Decompress(ms);
                logger.LogInformation($"Uploaded file extracted to {target}");
            }
            else
            {
                logger.LogError("Upload key not found");
                throw new ApplicationException("Upload key not found");
            }
        }
        private async Task RemoveFileUpload(string uploadkey)
        {
            Guid guid = Guid.Parse(uploadkey);
            Data.FileTransfer fu = polestarData.FileTransfers.SingleOrDefault(x => x.Id == guid);
            if (fu != null)
            {
                var chunks = fu.FileChunks.ToArray();
                polestarData.FileChunks.RemoveRange(chunks);
                polestarData.FileTransfers.Remove(fu);
                await polestarData.SaveChangesAsync();
            }
            else
            {
                logger.LogError("Upload key not found");
                throw new ApplicationException("upload key not found");
            }
        }
        private void CleanWebframeDistribution()
        {
            try
            {
                string folder = this.currentSatellite.distributionFolder;// SpecialFolders.GetDistributionFolder();
                string cssFolder = Path.Combine(folder, "Content", "Main", "DefaultCSS");
                var files = Directory.EnumerateFiles(cssFolder, "*.user.css");
                foreach (var file in files)
                {
                    System.IO.File.Delete(file);
                }
            }
            catch (Exception xe)
            {
                logger.LogError(xe.Message);
            }
        }
        private void EmptyDistribution()
        {
            try
            {
                string folder = this.currentSatellite.distributionFolder;// SpecialFolders.GetDistributionFolder();// Path.Combine(GetSatelliteDistributionRootFolder(), GetWebframeDeploymentName());
                Directory.Delete(folder, true);
                logger.LogInformation($"{folder} deleted");
            }
            catch (Exception xe)
            {
                logger.LogError(xe.Message);
            }
        }

        private void CreateRequiredBackupTasks()
        {
            if (!this.currentSatellite.isWebframeSource)
            {
                Task.Run(async () =>
                {
                    BackupHelper bh = new BackupHelper(taskManager, currentSatellite);
                    await bh.BackupSites();
                });
            }
        }
        private void CreateRequiredArchiveTasks()
        {
            if (this.currentSatellite.isWebframeArchive)
            {
                Task.Run(async () =>
                {
                    var bh = new ArchiveHelper(currentSatellite, this.Satellites);
                    await bh.ArchiveBackups();
                });
            }
        }
        private void CreatePurgeTask()
        {
            Task.Run(async () =>
            {
                var pt = new PurgeTask(this.currentSatellite);
                await taskManager.StartAsync(pt);
            });
        }
        private async Task UploadWebframeTosatellite(satellite target)
        {
            string tempfolder = Path.Combine(Path.GetTempPath(), "Polestar");
            if (!Directory.Exists(tempfolder))
            {
                Directory.CreateDirectory(tempfolder);
            }
            string publishFolder = this.currentSatellite.publishingFolder;// SpecialFolders.GetWebframePublishFolder();
            string zipFileName = Path.Combine(tempfolder, Path.GetFileNameWithoutExtension(Path.GetRandomFileName()) + ".zip");
            //Log.Write("DeployWebframe: random zipfilename is {0}", zipFileName);
            FolderCompression fc = new FolderCompression();
            fc.SourceFolder = publishFolder;
            fc.OutputFilename = zipFileName;
            try
            {
                using (var ml = new MessageListener(target.url))
                {
                    ml.AddHandler<zipProgress>((zp) => { messageHub.SendMessage(zp); });
                    ml.AddHandler<unZipFinished>((zf) => { messageHub.SendMessage(zf); });
                    await ml.Start();
                    fc.Compress();
                    logger.LogInformation($"{zipFileName} created");
                    await messageHub.SendMessage(new zipFinished());
                    var p2p = new Polestar2PolestarClient(target);
                    string key = await p2p.UploadFileToSatellite(zipFileName);
                    await p2p.FinaliseDeployment(key);
                    await messageHub.SendMessage(new uploadFinished());
                }
            }
            catch (Exception xe)
            {
                logger.LogError($"DeployWebframe() failed", xe);
            }
            finally
            {
                System.IO.File.Delete(zipFileName);
            }
        }
        private async Task UploadPolestarToSatellite(satellite target, string filename)
        {
            var p2p = new Polestar2PolestarClient(target);
            string key = await p2p.UploadFileToSatellite(filename);
            await p2p.FinaliseDeployment(key, polestar: true);
            await messageHub.SendMessage(new uploadFinished());
        }
    }
}
