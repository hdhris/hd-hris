import React from 'react';
import NavigationTabs, {TabItem} from "@/components/common/tabs/NavigationTabs";

function RootLayout({children}: { children: React.ReactNode }) {
    const tabs: TabItem[] = [
        {
            key: 'lists',
            title: 'Signatory Lists',
            path: 'lists'
        }
    ]
    return (
        <NavigationTabs tabs={tabs} basePath="signatories">
            {children}
        </NavigationTabs>
    );
}

export default RootLayout;