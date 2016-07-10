/// <reference path="enums.cs.d.ts" />
/// <reference path="version.cs.d.ts" />

declare module server {
	interface satellite {
		name: string;
        url: string;
		active: boolean;
		version: number;
		type: server.SatelliteType;
        satelliteType: string;
        isWebframeSource: boolean;
        //
        assemblyVersion: string;
        webframeRootDrive: string;
        webframeMarkerDll: string;
        machine: string;
        siteRootFolder: string;
        upgradeRootFolder: string;
		webframeIsUploaded: boolean;
        uploadedWebframeVersion: server.version;
        latestAvailableWebframeVersion: server.version;
        publishingFolder: string;
        distributionFolder: string;
        sites: server.site[];
	}
}
