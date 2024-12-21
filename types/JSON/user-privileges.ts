export interface UserPrivileges {
    web_access?: boolean;
    modules: {
        name: string,
        path: string[]
    }[]
    // admin_panel?: boolean;
}