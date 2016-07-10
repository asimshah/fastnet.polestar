/// <reference path="version.cs.d.ts" />

declare module server {
	interface satelliteInformation {
		machine: string;
		webframeIsUploaded: boolean;
		uploadedWebframeVersion: server.version;
	}
}
