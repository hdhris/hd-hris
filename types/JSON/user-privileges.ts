import { ModuleNames, PrivilegeNames } from "../privilege/privilege";

export interface UserPrivileges {
    web_access: boolean;
    modules: {
        name: ModuleNames;
        privileges: {
            name: PrivilegeNames;
            paths: string[];
        }[];
    }[];
}