import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import dayjs from "dayjs";

type DashboardContextType = {
    startYear: number;
    startSem: string | null;
    // setStartDate: (date: string | null) => void;
    // setEndDate: (date: string | null) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
    children: ReactNode;
    year?: number;
    sem?: string | null;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, year = new Date().getFullYear(), sem = null }) => {
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
    const [startSem, setStartSem] = useState<string | null>(null);

    useEffect(() => {
        setStartYear(year!);
        setStartSem(sem);
    }, [sem, year]);
    return (
        <DashboardContext.Provider value={{ startYear, startSem}}>
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