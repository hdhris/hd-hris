import React, {useState} from 'react';
import {Button} from "@nextui-org/button";
import {TbDatabaseExport, TbDatabaseImport} from "react-icons/tb";
import {ButtonProps, cn} from "@nextui-org/react";
import {icon_size_sm} from "@/lib/utils";
import Drawer from "@/components/common/Drawer";
import {FileUpload} from "@/components/ui/file-upload";
import {DataImportAndExportProps} from "@/components/common/data-display/types/types";

interface DataMigrationProps {
    className?: string
    importProps?: Omit<ButtonProps, "size" | "color" | "onClick" | "radius">
    exportProps?: Omit<ButtonProps, "size" | "color" | "onClick" | "radius">
    onExport: DataImportAndExportProps
    onImport: DataImportAndExportProps
}

function DataMigration({onExport, onImport, className, importProps, exportProps
}: DataMigrationProps) {
    const [onOpenImport, setOnOpenImport] = useState<boolean>(false)
    const [onOpenExport, setOnOpenExport] = useState<boolean>(false)
    return (
        <div className={cn("flex gap-2", className)}>
            {onExport && (<>
                    <Button size="sm" radius="md" color="primary"
                            {...exportProps}
                            onClick={() => setOnOpenExport(true)}><TbDatabaseExport
                        className={cn("text-white", icon_size_sm)}/>Export</Button>
                    <Drawer onClose={setOnOpenExport} isOpen={onOpenExport} {...onExport.drawerProps}>
                        <div>Exporting...</div>
                    </Drawer>
                </>

            )}
            {onImport && (<><Button size="sm" radius="md" color="primary" {...importProps}
                                    onClick={() => setOnOpenImport(true)}><TbDatabaseImport
                    className={cn("text-white", icon_size_sm)}/>Import</Button>
                    <Drawer onClose={setOnOpenImport} isOpen={onOpenImport} {...onImport.drawerProps}>
                        <FileUpload/>
                    </Drawer>
                </>


            )}
        </div>
    );
}

export default DataMigration;