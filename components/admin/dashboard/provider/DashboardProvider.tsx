import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import dayjs from "dayjs";

type DashboardContextType = {
    startDate: string | null;
    endDate: string | null;
    setStartDate: (date: string | null) => void;
    setEndDate: (date: string | null) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
    children: ReactNode;
    initialStartDate?: string | null;
    initialEndDate?: string | null;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, initialStartDate = null, initialEndDate = null }) => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    useEffect(() => {
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
    }, [initialEndDate, initialStartDate]);
    return (
        <DashboardContext.Provider value={{ startDate, endDate, setStartDate, setEndDate }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardDate = (): DashboardContextType => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};