import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormData<T> {
    method: "Add" | "Edit" | "View" | "Delete" | "Reset";
    data: T
}
// Define a generic context type
interface FormTableContextType<T> {
    formData: FormData<T> | null;
    setFormData: (data: FormData<T>) => void;
}

// Create the context with default values
const FormTableContext = createContext<FormTableContextType<any> | undefined>(undefined);

// Create a generic provider component
export const FormTableProvider = <T,>({ children }: { children: ReactNode }) => {
    const [formData, setFormData] = useState<FormData<T> | null>(null);

    return (
        <FormTableContext.Provider value={{ formData, setFormData }}>
            {children}
        </FormTableContext.Provider>
    );
};

// Custom hook for accessing the context

export function useFormTable<T>() {
    const context = useContext(FormTableContext) as FormTableContextType<T>;
    if (!context) {
        throw new Error('useFormTable must be used within a FormTableProvider');
    }
    return context;
}
