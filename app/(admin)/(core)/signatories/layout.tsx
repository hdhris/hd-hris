import React from 'react';
import NavigationTabs, {TabItem} from "@/components/common/tabs/NavigationTabs";

function RootLayout({children}: { children: React.ReactNode }) {
    const tabs: TabItem[] = [
        {
            key: 'lists',
            title: 'Signatory Lists',
            path: 'lists'
        }, {
            key: 'configuration',
            title: 'Signatory Configuration',
            path: 'configuration'
        }
    ]
    return (
        <NavigationTabs tabs={tabs} basePath="signatories">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;