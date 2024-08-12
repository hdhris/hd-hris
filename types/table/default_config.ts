export interface FilterProps{
    filtered: FilteredItemProps[]
    category: string
}

export interface FilteredItemProps {
    uid: string
    name: string
}


const default_config:FilterProps[] = [{
    filtered: [
        {name: "Active", uid: "active"},
        {name: "Suspend", uid: "suspend"},
        {name: "On Leave", uid: "on leave"},

    ],
    category: "Status"
}]