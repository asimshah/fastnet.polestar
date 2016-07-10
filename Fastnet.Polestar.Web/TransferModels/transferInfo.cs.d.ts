declare module server {
    interface transferInfo extends fastnet.messageBase {
        key: string;
        filename: string;
        length: number;
        chunkSize : number;
        totalChunks: number;
        chunkNumber: number;
    }
}