export interface IAppConfig {
    env: {
        name: string;
    };
    sta: {
        http: string;
        mqtt: {
            hostname: string,
            port: number,
            path: string
        };
    };
}
