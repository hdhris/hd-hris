import React, {useCallback, useEffect, useState} from 'react';
import {EditCreditProp} from "@/app/(admin)/(core)/leaves/leave-credits/page";
import FormDrawer from "@/components/common/forms/FormDrawer";

interface AddSignatoryFormProps {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean
}
function AddSignatoryForm({title, description, onOpen, isOpen}:AddSignatoryFormProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    useEffect(() => {
        if (isOpen !== isModalOpen) {
            setIsModalOpen(isOpen);
        }
    }, [isModalOpen, isOpen]);
    
    const handleModalOpen = useCallback((value: boolean) => {
        setIsModalOpen(value);
        onOpen(value);
    }, [onOpen]);
    return (<FormDrawer title={title || "Add A Signatory"}
                               description={description || "Fill out the form to add a signatory."}
                               onOpen={handleModalOpen} 
                               isOpen={isModalOpen}
                               // isLoading={isSubmitting}
                               // unSubmittable={!isValid || isAttachmentRequired ? (documentAttachments.length === 0 && (!url || url.length === 0)) : false}
    >
            <></>
    </FormDrawer>
    );
}

export default AddSignatoryForm;