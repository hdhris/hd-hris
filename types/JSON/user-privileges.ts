import { ModuleNames } from "../privilege/privilege";

export interface UserPrivileges {
    web_access: boolean;
    modules: {
        name: ModuleNames;
        privileges: {
            name: string;
            paths: string[];
        }[];
    }[];
}