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
}
