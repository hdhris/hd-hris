export interface Accounts {
    userAccount: {
      id: number;
      email: string;
      auth_credentials: { 
        id: number; 
        username: string; 
        password: string;
      };
    } | null;
    acl_user_access_control?: {  // Add this
      privilege_id: string;
      sys_privileges?: {
        id: string;
        name: string;
      };
    } | null;
    currentPrivilegeId?: string | null;
    privilege?: {
      id: string;
      name: string;
    } | null;
  }