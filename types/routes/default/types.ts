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
export interface Profile {
    addresses: Address[];
    users : UserProfile;
}
export interface UserProfile {
    username: string;
    picture: string;
    prefix: string | null;
    first_name: string;
    last_name: string;
    suffix?: string | null;
    extension: string | null;
    email: string;
    birthdate: string; // ISO 8601 date string
    gender: string; // Assuming gender is limited to 'M' or 'F'
    contact_no: string;
    addr_baranggay: number;
    addr_municipal: number;
    addr_province: number;
    addr_region: number;
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



