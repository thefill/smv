export interface ISemVerDigest {
    options: {
        loose: boolean;
        includePrerelease: boolean;
    };
    loose: boolean;
    raw: string;
    major: number;
    minor: number;
    patch: number;
    prerelease: string[];
    build: string[];
    version: string;
}
