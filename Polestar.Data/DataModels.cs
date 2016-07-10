using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Polestar.Data
{
    public class FileTransfer
    {
        [Key]
        [DatabaseGenerated(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string Filename { get; set; }
        public bool Completed { get; set; }
        public long ChunksTransferred { get; set; }
        public long TotalChunks { get; set; }
        public int ChunkSize { get; set; }
        public System.DateTimeOffset? TransferStartedAt { get; set; }
        public System.DateTimeOffset? TransferCompletedAt { get; set; }
        public virtual ICollection<FileChunk> FileChunks { get; set; }
    }
    public class FileChunk
    {
        public long FileChunkId { get; set; }
        public FileTransfer FileTransfer { get; set; }
        public long ChunkNumber { get; set; }
        public byte[] Data { get; set; }
    }

}
