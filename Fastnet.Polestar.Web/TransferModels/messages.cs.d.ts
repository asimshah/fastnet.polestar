
declare module server {

    interface zipProgress extends fastnet.messageBase {
        direction: string;
        grossTotal: number;
        completed: number;
    }
    interface zipFinished extends fastnet.messageBase {

    }
    interface unZipFinished extends fastnet.messageBase {

    }
    interface uploadFinished extends fastnet.messageBase {

    }
}