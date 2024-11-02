export interface DrawerFormTypes {
    title?: string
    description?: string
    onOpen: (value: boolean) => void
    isOpen: boolean,
}