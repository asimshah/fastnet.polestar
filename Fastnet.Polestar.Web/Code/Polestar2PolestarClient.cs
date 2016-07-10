using Fastnet.Core.Web;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using Fastnet.Core.Web.Controllers;
using Fastnet.Core.Web.Messaging;

namespace Fastnet.Polestar.Web
{
    public class Polestar2PolestarClient : WebApiClient
    {
        private readonly ILogger<Polestar2PolestarClient> logger;
        public Polestar2PolestarClient(satellite target) : base(target.url)
        {
            logger = ProviderHelper.ServiceProvider.GetService<ILogger<Polestar2PolestarClient>>();
        }
        public async Task<string> UploadFileToSatellite(string filename)
        {
            IMessageHubManager messageHub = ProviderHelper.ServiceProvider.GetService<IMessageHubManager>();
            FileInfo fi = new FileInfo(filename);
            var r = await GetUploadKey(fi.Name);
            string key = (string)r.UploadKey;
            int chunkSize = (int)r.ChunkSize;
            long total = fi.Length / chunkSize + (fi.Length % chunkSize > 0 ? 1 : 0);
            await SetUploadTotal(key, total);
            TransferInfo ti = new TransferInfo
            {
                key = key,
                filename = fi.Name,
                length = fi.Length,
                chunkSize = chunkSize,
                totalChunks = total
            };
            await messageHub.SendMessage(ti);
            using (var fs = new FileStream(filename, FileMode.Open, FileAccess.Read))
            {
                byte[] buffer = new byte[chunkSize];
                int length = 0;
                long chunkNumber = 0;
                do
                {
                    try
                    {
                        length = await fs.ReadAsync(buffer, 0, chunkSize);
                        if (length > 0)
                        {
                            var transfer = new byte[length];
                            Array.Copy(buffer, transfer, length);
                            var data = new
                            {
                                Key = key,
                                ChunkNumber = chunkNumber++,
                                Data = transfer
                            };
                            await AddFileChunk(data);
                            ti.chunkNumber = chunkNumber;
                            await messageHub.SendMessage(ti);
                        }
                    }
                    catch (Exception xe)
                    {
                        logger.LogError($"UploadFileToSatellite failed at chunk number {chunkNumber}", xe);
                        throw;
                    }

                } while (length > 0);
            }

            return key;
            //}
        }

        internal async Task<byte[]> GetFileChunk(string backupFilename, long offset, int transferLength)
        {
            int retryCount = 3;
            while (retryCount-- > 0)
            {
                try
                {
                    string url = $"cmd/get/chunk/{Uri.EscapeUriString(backupFilename)}/{offset}/{transferLength}";
                    dataResult result = await GetAsync<dataResult>(url);
                    //dynamic d = (dynamic)result.data;
                    string base64 = (string)result.data;
                    var data = Convert.FromBase64String(base64);
                    logger.LogTrace($"{backupFilename}, {data.Length}");
                    return data;
                }
                catch (Exception xe)
                {
                    if (retryCount > 0)
                    {
                        logger.LogError($"GetFileChunk failed: {xe.Message}, retry count is {retryCount} ...");
                    }
                    else
                    {
                        logger.LogError($"GetFileChunk failed: {xe.Message}");
                        throw;
                    }
                  
                }
            }
            return null;
        }
        //internal async Task FinaliseArchive(string key, string satelliteName)
        //{
        //    satelliteName = Uri.EscapeUriString(satelliteName);
        //    string url = $"cmd/archive/finalise/{key}/{satelliteName}";
        //    await GetAsync(url);
        //    return;
        //}

        public async Task FinaliseDeployment(string key, bool polestar = false)
        {
            string url = $"cmd/deployment/{(polestar ? "polestar": "webframe")}/finalise/{key}";
            await GetAsync(url);
            //Debugger.Break();
            return;
        }

        internal async Task<IEnumerable<string>> GetBackupList()
        {
            string url = $"cmd/backup/list";
            dataResult result = await GetAsync<dataResult>(url);
            var list = ((JArray)result.data).Select(x => (string)x);
            return list;
        }

        //public async Task<IEnumerable<string>> GetArchiveList(string satelliteName)
        //{
        //    satelliteName = Uri.EscapeUriString(satelliteName);
        //    string url = $"cmd/archive/list/{satelliteName}";
        //    dataResult result = await GetAsync<dataResult>(url);
        //    return (IEnumerable<string>)result.data;
        //}
        private async Task<dynamic> GetUploadKey(string fileName)
        {
            try
            {
                string extension = Path.GetExtension(fileName).Substring(1);
                fileName = Path.GetFileNameWithoutExtension(fileName);
                string url = string.Format("cmd/get/uploadkey/{0}/{1}", fileName, extension);
                var dr = await GetAsync<dataResult>(url);
                return (dynamic)dr.data;
            }
            catch (Exception xe)
            {
                logger.LogError($"{this.BaseAddress} GetUploadKey({fileName}) failed", xe);
                throw;
            }
        }
        private async Task SetUploadTotal(string key, long total)
        {
            string url = string.Format("cmd/setuploadtotal/{0}/{1}", key, total);
            dataResult dr = await GetAsync<dataResult>(url);
            return;
        }
        private async Task<dynamic> AddFileChunk(dynamic data)
        {
            int retryCount = 3;
            while (retryCount-- > 0)
            {
                try
                {
                    string url = string.Format("cmd/add/chunk");
                    dataResult result = await PostAsync<dynamic, dataResult>(url, data);
                    logger.LogTrace($"Chunk {data.ChunkNumber.ToString()} sent, {data.Data.Length.ToString()} bytes");
                    return (dynamic)result.data;
                }
                catch (Exception xe)
                {
                    if (retryCount > 0)
                    {
                        logger.LogError($"AddFileChunk failed: {xe.Message}, retry count is {retryCount} ...");
                    }
                    else
                    {
                        logger.LogError($"AddFileChunk failed: {xe.Message}");
                        throw;
                    }
                }
            }
            return null;
        }
        
    }
}
