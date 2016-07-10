using Fastnet.Polestar.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Web
{
    public class TransferHelper
    {
        private readonly ILogger<TransferHelper> logger;
        private readonly DataContext polestarData;
        public TransferHelper()
        {
            this.logger = ProviderHelper.ServiceProvider.GetService<ILogger<TransferHelper>>();
            polestarData = ProviderHelper.ServiceProvider.GetService<DataContext>();
        }
        public async Task ReassembleFile(string uploadkey, string targetFolder)
        {
            logger.LogInformation($"ReassembleFile(): key {uploadkey}");
            byte[] data = null;
            Guid guid = Guid.Parse(uploadkey);
            FileTransfer fu = polestarData.FileTransfers.SingleOrDefault(x => x.Id == guid);
            if (fu != null)
            {
                string filename = Path.Combine(targetFolder, fu.Filename);
                data = GetBytes(fu);
                MemoryStream ms = new MemoryStream(data);
                FileStream fs = new FileStream(filename, FileMode.Create);
                await ms.CopyToAsync(fs);
                ms.Close();
                fs.Close();
                logger.LogInformation($"File written to {filename}");
            }
            else
            {
                logger.LogError("Transfer key not found");
                throw new ApplicationException("Transfer key not found");
            }
        }
        public byte[] GetBytes(FileTransfer fu)
        {
            var chunks = fu.FileChunks.OrderBy(fc => fc.ChunkNumber);
            var length = chunks.Sum(x => x.Data.Length);
            byte[] buffer = new byte[length];
            int offset = 0;
            foreach (var fc in chunks)
            {
                Buffer.BlockCopy(fc.Data, 0, buffer, offset, fc.Data.Length);
                offset += fc.Data.Length;
                //logger.LogTrace($"FileUpload key {fu.Id.ToString()}: assembling chunk {fc.ChunkNumber} of {chunks.Count()}");
            }
            logger.LogInformation($"FileUpload key {fu.Id.ToString()}: {buffer.Length} bytes assembled from {chunks.Count()} chunks");
            return buffer;
        }
    }
}
