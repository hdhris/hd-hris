import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from './layout';
import { usePathname } from 'next/navigation'; // Adjust the import based on how you use usePathname

// Mock usePathname hook
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock components that are not the focus of this test
jest.mock('@/components/sidebar/SideBar', () => {
    const MockedSideBar = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    MockedSideBar.displayName = 'MockedSideBar';
    return MockedSideBar;
});

jest.mock('@/components/sidebar/SideBarItem', () => {
    const MockedSideBarItem = ({ label, href }: { label: string; href: string }) => (
        <a href={href}>{label}</a>
    );
    MockedSideBarItem.displayName = 'MockedSideBarItem';
    return MockedSideBarItem;
});

describe('RootLayout - SideBar', () => {
    beforeEach(() => {
        // Reset mock state before each test
        (usePathname as jest.Mock).mockReturnValue('/dashboard');
    });

    it('renders the SideBarItem with correct href and label based on pathname', () => {
        render(<RootLayout>{''}</RootLayout>);

        // Check if the SideBarItem for "Dashboard" is active and rendered with the correct href
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');

        // Check if other SideBarItems are rendered correctly
        expect(screen.getByText('Employee Management')).toBeInTheDocument();
        expect(screen.getByText('Employee Management').closest('a')).toHaveAttribute('href', '/employeemanagement');
        expect(screen.getByText('Attendance & Time')).toBeInTheDocument();
        expect(screen.getByText('Attendance & Time').closest('a')).toHaveAttribute('href', '/attendance-time');
        // Add checks for all other sidebar items similarly
    });
});
