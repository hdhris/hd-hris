import { useEffect, useState, useCallback } from 'react';
import {useIntegrations} from "@/services/queries";
import {Integrations} from "@/types/routes/default/types";


const useIntegrationSelection = (type: 'database' | 'cloud_storage' | 'attendance_monitoring') => {
    const { data} = useIntegrations();
    const [items, setItems] = useState<Integrations[]>([]);

    useEffect(() => {
        if (data) {
            setItems(data.filter(item => item.type === type));
        }
    }, [data, type]);
    


    return {
        items
    };
};

export default useIntegrationSelection;
