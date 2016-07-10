/// <reference path="version.cs.d.ts" />

declare module server {
	interface deploymentInfo {
		deploymentIsAvailable: boolean;
		version: server.version;
	}
}
