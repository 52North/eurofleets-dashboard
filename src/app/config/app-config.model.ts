export interface IAppConfig {
    sta: {
        http: string;
        mqtt: {
            hostname: string,
            port: number,
            path: string
        };
    };
    apiUrl: string;
    trajectoryDatasets: {
        phenomenonDomainId: string;
        color: string;
    }[];
    courseOverGroundTrajectoryMapping: string;
    dashboardDatastreamMapping: string[];
    courseOverGroudLiveMapping: string;
}
