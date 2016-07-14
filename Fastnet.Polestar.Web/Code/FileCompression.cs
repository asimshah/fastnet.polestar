using Ionic.Zip;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.IO;
using Fastnet.Core.Web.Messaging;

namespace Fastnet.Polestar.Web
{

    public class FolderCompression
    {
        public string SourceFolder { get; set; }
        public string DestinationFolder { get; set; }
        public string OutputFilename { get; set; }
        //private readonly IMessageHubManager messageHub;
        private readonly ILogger<FolderCompression> logger;
        public FolderCompression()
        {
            //messageHub = ProviderHelper.ServiceProvider.GetService<IMessageHubManager>();
            logger = ProviderHelper.ServiceProvider.GetService<ILogger<FolderCompression>>();
        }
        public void Compress()
        {

            Debug.Assert(Directory.Exists(SourceFolder));
            Debug.Assert(!string.IsNullOrWhiteSpace(OutputFilename));
            try
            {
                DirectoryInfo source = new DirectoryInfo(SourceFolder);
                using (ZipFile zip = new ZipFile())
                {
                    zip.UseZip64WhenSaving = Zip64Option.Always;
                    zip.ZipError += (s, e) =>
                    {
                        ZipError ze = new ZipError { Error = e.Exception.Message, FileName = e.FileName };
                        //ze.Send();
                        logger.LogError($"Compress: Error processing file {e.FileName}: {e.Exception.Message}, skipped");
                    };
                    zip.SaveProgress += (s, e) =>
                    {
                        switch (e.EventType)
                        {
                            case ZipProgressEventType.Saving_BeforeWriteEntry:
                                logger.LogDebug($"zipping {e.EntriesSaved + 1 } of { e.EntriesTotal}");
                                //zipProgress zp = new zipProgress { direction = "Compressing", grossTotal = e.EntriesTotal, completed = e.EntriesSaved + 1 };
                                //messageHub.SendMessage(zp);
                                break;
                        }
                    };
                    //Debug.WriteLine(source.Name);
                    zip.AddDirectory(SourceFolder);//, source.Name);
                    if (File.Exists(OutputFilename))
                    {
                        File.Delete(OutputFilename);
                    }
                    zip.Save(OutputFilename);
                }
            }
            catch (Exception xe)
            {
                logger.LogError($"Compress()", xe);
                throw;
            }
        }
        public void Decompress(Stream stream)
        {
            ZipFile zip = ZipFile.Read(stream);
            extract(zip);
        }
        public void Decompress(string zipfileName)
        {
            ZipFile zip = new ZipFile(zipfileName);
            extract(zip);
        }
        private void extract(ZipFile zip)
        {
            Debug.Assert(Directory.Exists(DestinationFolder));
            try
            {
                using (zip)
                {
                    zip.ExtractProgress += (s, e) =>
                    {
                        if (e.EventType == ZipProgressEventType.Extracting_AfterExtractEntry)
                        {
                            logger.LogDebug($"zipping { e.EntriesExtracted + 1  } of { e.EntriesTotal}");
                            //zipProgress zp = new zipProgress { direction = "Decompressing", grossTotal = e.EntriesTotal, completed = e.EntriesExtracted + 1 };
                            //messageHub.SendMessage(zp);
                        }
                    };
                    zip.ExtractAll(DestinationFolder);
                }
            }
            catch (Exception xe)
            {
                logger.LogError($"extract()", xe);
            }
        }
    }
}
