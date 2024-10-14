export interface FilterProps{
    filtered: FilteredItemProps[]
    category: string
}

export interface FilteredItemProps {
    key: string
    value: string | boolean | number
    name: string
}


// const default_config:FilterProps[] = [{
//     filtered: [
//         {name: "Active", uid: "active"},
//         {name: "Suspend", uid: "suspend"},
//         {name: "On Leave", uid: "on leave"},

//     ],
//     category: "Status"
// }]