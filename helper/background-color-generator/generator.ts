import uniqolor from "uniqolor";

export const bgColor = (name: string) => {
    return {
        style: {
            background: uniqolor(name).color
        }
    }
}