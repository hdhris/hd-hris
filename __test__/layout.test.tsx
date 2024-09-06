import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '../app/(admin)/layout';
import { usePathname } from 'next/navigation';
import dayjs from "dayjs";
import DateComponent from "@/components/date/DateComponent";
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

describe('Admin RootLayout - SideBar', () => {
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
        expect(screen.getByText('Leaves Application')).toBeInTheDocument();
        expect(screen.getByText('Leaves Application').closest('a')).toHaveAttribute('href', '/leaves');
        expect(screen.getByText('Payroll')).toBeInTheDocument();
        expect(screen.getByText('Payroll').closest('a')).toHaveAttribute('href', '/payroll');
        expect(screen.getByText('Benefits')).toBeInTheDocument();
        expect(screen.getByText('Benefits').closest('a')).toHaveAttribute('href', '/benefits');
        expect(screen.getByText('Performance Appraisal')).toBeInTheDocument();
        expect(screen.getByText('Performance Appraisal').closest('a')).toHaveAttribute('href', '/performance');
        expect(screen.getByText('Privileges')).toBeInTheDocument();
        expect(screen.getByText('Privileges').closest('a')).toHaveAttribute('href', '/privileges');
        expect(screen.getByText('Incident Report')).toBeInTheDocument();
        expect(screen.getByText('Incident Report').closest('a')).toHaveAttribute('href', '/incident-report');
        expect(screen.getByText('Training And Seminars')).toBeInTheDocument();
        expect(screen.getByText('Training And Seminars').closest('a')).toHaveAttribute('href', '/training&seminars');
        expect(screen.getByText('Reports')).toBeInTheDocument();
        expect(screen.getByText('Reports').closest('a')).toHaveAttribute('href', '/reports');

    });
});



describe("DateComponent", () => {
    it("should render the correct current date and time with onClockShow=true", () => {
        // Render the DateComponent with onClockShow=true
        render(<DateComponent onClockShow={true} />);

        // Get the current date and time
        const now = dayjs();
        const day = now.format("DD");           // "25"
        const month = now.format("MMM");         // "Aug"
        const year = now.format("YYYY");         // "2024"
        const dayName = now.format("ddd");       // "Sun"
        const time = now.format("hh:mm A");      // "03:27 PM"

        // Check if the DateComponent renders the current date and time
        expect(screen.getByText(day)).toBeInTheDocument();
        expect(screen.getByText(month)).toBeInTheDocument();
        expect(screen.getByText(year)).toBeInTheDocument();
        expect(screen.getByText(dayName)).toBeInTheDocument();
        expect(screen.getByText(time)).toBeInTheDocument();
    });

    it("should render the correct current time without clock in 24-hour format with onClockShow=false", () => {
        // Render the DateComponent with onClockShow=false
        render(<DateComponent onClockShow={false} />);

        // Get the current time in 24-hour format
        const now = dayjs();
        const hours = now.format("HH");          // "15"
        const minutes = now.format("mm");        // "27"

        // Check if the DateComponent renders the correct time
        expect(screen.getByText(hours)).toBeInTheDocument();
        expect(screen.getByText(minutes)).toBeInTheDocument();
    });
});

