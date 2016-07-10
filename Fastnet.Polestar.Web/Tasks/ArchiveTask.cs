using Fastnet.Polestar.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core.Web.Tasks;

namespace Fastnet.Polestar.Web
{
    public class ArchiveTask : ITask
    {
        private satellite current;
        private satellite target;
        private string backupFilename;
        private string archiveFolder;
        private PolestarConfiguration config;
        private string polestarConnectionString;
        private readonly int transferlength;
        public ArchiveTask(satellite current, satellite target, string backupFilename)
        {
            var options = ProviderHelper.ServiceProvider.GetService<Microsoft.Extensions.Options.IOptions<PolestarConfiguration>>();
            this.config = options.Value;
            IConfigurationRoot configRoot = ProviderHelper.ServiceProvider.GetService<IConfigurationRoot>();
            polestarConnectionString = configRoot["Data:PolestarDb:ConnectionString"];
            this.current = current;
            this.target = target;
            this.backupFilename = backupFilename;
            transferlength = 1024 * config.FileTransferBufferLength;
            this.archiveFolder = Path.Combine(this.current.webframeArchiveFolder, target.name);
        }
        public string GetId()
        {
            return this.GetType().FullName;
        }
        public async Task<TaskResult> Execute(ILogger logger, params object[] args)
        {
            TaskResult tr = new TaskResult { Success = false };
            try
            {
                string key = await GetDownloadKey();
                await DownloadFile(key);
                var th = new TransferHelper();
                await th.ReassembleFile(key, archiveFolder);
                tr.Success = true;
                tr.CompletionRemark = $"{this.backupFilename} downloaded from {target.url}";
                logger.LogInformation($"{this.backupFilename} downloaded from {target.url}");
            }
            catch (Exception xe)
            {
                logger.LogError($"Download of {this.backupFilename} from {target.url} failed", xe);
                tr.CompletionRemark = $"Download of {this.backupFilename} from {target.url} failed";
                tr.Exception = xe;
            }
            return tr;
        }

        private async Task DownloadFile(string key)
        {
            using (var ctx = new DataContext(ProviderHelper.ServiceProvider, polestarConnectionString))
            {
                FileTransfer ft = ctx.FileTransfers.Single(x => x.Id.ToString() == key);
                var p2p = new Polestar2PolestarClient(target);
                bool finished = false;
                long offset = 0;
                int chunkNumber = 0;
                while (!finished)
                {
                    byte[] data = await p2p.GetFileChunk(this.backupFilename, offset, transferlength);
                    FileChunk fc = new FileChunk
                    {
                        FileTransfer = ft,
                        Data = data,
                        ChunkNumber = chunkNumber++
                    };
                    ctx.FileChunks.Add(fc);
                    ctx.SaveChanges();
                    offset += data.Length;
                    finished = data.Length < transferlength;
                }
            }
        }

        private async Task<string> GetDownloadKey()
        {
            using (var ctx = new DataContext(ProviderHelper.ServiceProvider, polestarConnectionString))
            {
                FileTransfer fu = new FileTransfer
                {
                    ChunkSize = 1024 * config.FileTransferBufferLength,// ApplicationSettings.Key("UploadChunkSize", 1024 * 512),
                    Filename = backupFilename
                };
                ctx.FileTransfers.Add(fu);
                await ctx.SaveChangesAsync();
                string key = fu.Id.ToString();
                return key;
            }
        }
    }
}
