export interface SelectionProp {
    placeholder?: string,
    items: string[],
    className?: string
    onChange?:(...event: any[]) => void
}