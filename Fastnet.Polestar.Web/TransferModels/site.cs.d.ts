declare module server {
	interface site {
		name: string;
		host: string;
		port: number;
		path: string;
		poolName: string;
        databaseNames: string[];
        isWebframe: boolean;
		isPaused: boolean;
		isUpgradeable: boolean;
		version: {
			major: number;
			minor: number;
			revision: number;
			build: number;
		};
	}
}
