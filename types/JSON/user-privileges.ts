export interface UserPrivileges {
    web_access: boolean;
    modules: {
        name: string,
        path: string[]
    }[]
}