import React, { createContext, useContext, useState, ReactNode } from 'react';
import {toGMT8} from "@/lib/utils/toGMT8";

// Define the shape of the context state
interface ControlState {
    department: number; // Example state property
    date: {
        start: string;
        end: string;
    };
}

// Define the shape of the context value
interface ControlContextType {
    value: ControlState;
    updateValue: (newValue: ControlState) => void;
    isGenerated: boolean;
    setIsGenerated: (isGenerated: boolean) => void;
}

// Create the context with a default value
const ControlContext = createContext<ControlContextType | undefined>(undefined);

// Custom hook to use the ControlContext
export const useControl = (): ControlContextType => {
    const context = useContext(ControlContext);
    if (!context) {
        throw new Error('useControl must be used within a ControlProvider');
    }
    return context;
};

// Define the props for the provider
interface ControlProviderProps {
    children: ReactNode;
}

// Provider component
const ControlProvider: React.FC<ControlProviderProps> = ({ children }) => {
    const [state, setState] = useState<ControlState>({
        department: 0,
        date: {
            start: toGMT8().toISOString(),
            end: toGMT8().toISOString(),
        }, // Initially, no report is generated
    });

    const [isGenerated, setIsGenerated] = useState<boolean>(false);

    const updateValue = (newValue: ControlState) => {
        setState(newValue);
    };

    const contextValue: ControlContextType = {
        value: state,
        updateValue,
        isGenerated,
        setIsGenerated,
    };

    return (
        <ControlContext.Provider value={contextValue}>
            {children}
        </ControlContext.Provider>
    );
};

export default ControlProvider;
