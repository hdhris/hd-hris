import React from 'react';
import NavigationTabs, {TabItem} from "@/components/common/tabs/NavigationTabs";

function RootLayout({children}: { children: React.ReactNode }) {
    const tabs: TabItem[] = [
        {
            key: 'leave-requests',
            title: 'Leave Approvals',
            path: 'leave-requests'
        }, {
            key: 'leave-types',
            title: 'Leave Types',
            path: 'leave-types'
        }, {
            key: 'leave-credits',
            title: 'Leave Credits',
            path: 'leave-credits'
        }
    ]
    return (
        <NavigationTabs tabs={tabs} basePath="leaves">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;