declare module server {
    interface uploadInfo {
        satellite: satellite;
        isPolestarUpload: boolean;
        key: string;
        filename: string;
        length: number;
        chunkSize: number;
        totalChunks: number;
        chunkNumber: number;
    }
}