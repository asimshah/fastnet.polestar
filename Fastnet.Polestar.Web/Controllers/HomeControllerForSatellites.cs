using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Microsoft.Extensions.Logging;
using Fastnet.Polestar.Data;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Fastnet.Polestar.Web.Controllers
{
    public partial class HomeController
    {
        [HttpGet("backup/list")]
        public IActionResult GetBackupList()
        {
            var bh = new BackupHelper(taskManager, currentSatellite);
            var list = bh.GetBackupList();
            return SuccessResult(list);
        }
        [HttpGet("get/chunk/{backupFilename}/{offset}/{transferLength}")]
        public async Task<IActionResult> GetChunk(string backupFilename, long offset, int transferLength)
        {
            backupFilename = Path.Combine(this.currentSatellite.backupFolder, backupFilename);
            if (System.IO.File.Exists(backupFilename))
            {
                using (var fs = System.IO.File.Open(backupFilename, FileMode.Open, FileAccess.Read))
                {
                    fs.Seek(offset, SeekOrigin.Begin);
                    var data = new byte[transferLength];
                    var length = await fs.ReadAsync(data, 0, data.Length);
                    if (length < transferLength)
                    {
                        var buf = new byte[length];
                        Array.Copy(data, buf, length);
                        data = buf;
                    }
                    //logger.LogInformation($"{backupFilename}, {data.Length} bytes read from position {offset}");
                    return SuccessResult(data);
                }
            }
            else
            {
                return ErrorResult($"{backupFilename} not found");
            }
        }
        [HttpGet("get/uploadkey/{filename}/{ext}")]
        public async Task<IActionResult> GetUploadKey(string filename, string ext)
        {
            try
            {
                filename += "." + ext;
                FileTransfer fu = new FileTransfer
                {
                    ChunkSize = 1024 * config.FileTransferBufferLength,// 512,// ApplicationSettings.Key("UploadChunkSize", 1024 * 512),
                    Filename = filename
                };
                polestarData.FileTransfers.Add(fu);
                await polestarData.SaveChangesAsync();
                logger.LogInformation($"Upload requested for {filename} - key {fu.Id.ToString()}, block size {fu.ChunkSize}");
                return SuccessResult(new { UploadKey = fu.Id.ToString(), ChunkSize = fu.ChunkSize });
            }
            catch (Exception xe)
            {
                logger.LogError(xe.Message);
                return ErrorResult(xe.Message);
            }
        }
        [HttpGet("setuploadtotal/{key}/{total}")]
        public async Task<IActionResult> SetUploadTotal(string key, long total)
        {
            Guid guid = Guid.Parse(key);
            FileTransfer fu = polestarData.FileTransfers.SingleOrDefault(x => x.Id == guid);
            if (fu != null)
            {
                fu.TotalChunks = total;
                await polestarData.SaveChangesAsync();
                return SuccessResult(null);
            }
            else
            {
                return ErrorResult("Upload key not found");
            }
        }
        [HttpPost("add/chunk")]
        public async Task<IActionResult> AddFileChunk([FromBody] dynamic chunk)
        {
            try
            {
                string key = chunk.Key;
                Guid guid = Guid.Parse(key);
                FileTransfer fu = polestarData.FileTransfers.SingleOrDefault(x => x.Id == guid);
                if (fu != null)
                {
                    int chunkNumber = chunk.ChunkNumber;
                    FileChunk fc = polestarData.FileChunks.SingleOrDefault(x => x.FileTransfer.Id == guid && x.ChunkNumber == chunkNumber);
                    if (fc == null)
                    {
                        if (chunkNumber < fu.TotalChunks && chunkNumber >= 0)
                        {
                            byte[] dataBytes = chunk.Data;
                            fc = new FileChunk
                            {
                                FileTransfer = fu,
                                ChunkNumber = chunkNumber,
                                Data = dataBytes
                            };
                            fu.ChunksTransferred++;
                            polestarData.FileChunks.Add(fc);
                            await polestarData.SaveChangesAsync();
                            logger.LogTrace($"Chunk {fc.ChunkNumber} of {fu.TotalChunks}, {dataBytes.Length} bytes");
                            return SuccessResult(new { Success = true });
                        }
                        else
                        {
                            logger.LogWarning($"Chunk {chunkNumber} out of range");
                            return ErrorResult("Chunk number out of range");
                        }
                    }
                    else
                    {
                        logger.LogError($"Chunk {chunkNumber} is a duplicate");
                        return ErrorResult("Duplicate chunk number");
                    }
                }
                else
                {
                    return ErrorResult("Upload key not found");
                }
            }
            catch (Exception xe)
            {
                logger.LogError("AddFileChunk() failed", xe);
                return ErrorResult(xe.Message, "AddFileChunk() failed");
            }
        }
        [HttpGet("deployment/polestar/finalise/{key}")]
        //[Route("deployment/polestar/finalise/{key}")]
        public async Task<IActionResult> FinalisePolestarDeployment(string key)
        {
            string polestarDestinationFolder = this.currentSatellite.polestarDestinationFolder;
            if (!Directory.Exists(polestarDestinationFolder))
            {
                Directory.CreateDirectory(polestarDestinationFolder);
                logger.LogInformation($"{polestarDestinationFolder} created");
            }
            var th = new TransferHelper();
            await th.ReassembleFile(key, polestarDestinationFolder);
            await RemoveFileUpload(key);
            return SuccessResult(null);
        }
        [HttpGet("deployment/webframe/finalise/{key}")]
        //[Route("deployment/webframe/finalise/{key}")]
        public async Task<IActionResult> FinaliseWebframeDeployment(string key)
        {
            string satelliteDistributionFolder = this.currentSatellite.distributionFolder;// SpecialFolders.GetSatelliteDistributionRootFolder();
            logger.LogInformation($"finalise webframe deployment for {key}");
            ExtractUploadedFile(key, satelliteDistributionFolder);
            await RemoveFileUpload(key);
            CleanWebframeDistribution();
            return SuccessResult(null);
        }
        //
        //
        //
        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            await Task.Delay(0);
            return SuccessResult(null, "hello world");
        }

    }
}
