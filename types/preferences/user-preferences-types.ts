export interface UserNotificationSettings {
    allow_email: boolean;
    allow_push: boolean;
    do_not_disturb: boolean;
    notification_sound: string;
}

export interface UserSecurityQuestion {
    question: string;
    answer: string;
}

export interface UserSecurity {
    "2FA": "off" | "email";
    recovery_codes: string[];
    security_questions: UserSecurityQuestion[];
}

export interface UserAgreements {
    privacy_policy: string;
    terms_and_conditions: string;
}

export interface UserSettings {
    notification_settings: UserNotificationSettings;
    security: UserSecurity | null;
    agreements: UserAgreements | null;
}