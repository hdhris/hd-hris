import {TopDepartmentList, TopEmployeeList} from "@/types/dashboard/topLists";
import {getRandomInt} from "@/lib/utils/numberFormat";

const topEmployeeList: TopEmployeeList[] = [
    {
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
        name: "John Doe",
        email: "john.doe@example",
        amount: getRandomInt(1000, 20000),
    },
    {
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
        name: "Jane Smith",
        email: "jane.smith@example",
        amount: getRandomInt(1000, 20000),
    },
    {
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png",
        name: "Michael Johnson",
        email: "michael.johnson@example",
        amount: getRandomInt(1000, 20000),
    },
    {
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/4.png",
        name: "Emily Brown",
        email: "emily.brown@example",
        amount: getRandomInt(1000, 20000),
    },
    {
        picture: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/5.png",
        name: "David Lee",
        email: "david.lee@example",
        amount: getRandomInt(1000, 20000),
    },
];

const topDepartmentList: TopDepartmentList[] = [
    {
        name: "Sales",
        color: "23A6F0",
        amount: getRandomInt(1000, 20000)
    },
    {
        name: "Marketing",
        color: "F8B425",
        amount: getRandomInt(1000, 20000)
    },
    {
        name: "Engineering",
        color: "ac27ca",
        amount: getRandomInt(1000, 20000)
    },
    {
        name: "Finance",
        color: "F8B425",
        amount: getRandomInt(1000, 20000)
    },
    {
        name: "Customer Service",
        color: "ba68c8",
        amount: getRandomInt(1000, 20000)
    }
];

export {topEmployeeList, topDepartmentList};

