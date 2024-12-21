export interface Integrations {
    key: string;
    avatarSrc: string;
    title: string;
    subtitle: string;
    type: string;
}
export interface Address {
    address_code: number;
    address_name: string;
    parent_code: number | null;
}
// export interface Profile {
//     addresses: Address[];
//     users : UserProfile;
// }
export interface UserProfile {
    hasCredential: boolean
    username?: string;
    display_name: string;
    image: string;
    privilege: string;
    isLoggedOut: boolean
}


export interface LoginActivity {
    key: string;
    device_name: string;
    device_icon: string;
    platform: string;
    date: string;
    time: string;
    ip_address: string;
    location: string;
    access_method: string;
}

export interface BackupEntry {
    id: number;
    date: string;
    time: string;
    type: 'Full Backup' | 'Incremental' | 'Differential';
    size: string;
    status: 'Completed' | 'Failed';
}

export interface NotificationConfiguration {
    isAllowEmailNotification: boolean;
    isAllowPushNotification: boolean;
    isDoNotDisturb: boolean;
    notificationSound: string;
}


