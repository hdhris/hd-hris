import uniqolor from "uniqolor";
import {rgba} from "color2k";

export const bgColor = (name: string, alpha?: number) => {
   const color = getColor(name, alpha)
    return {
        style: {
            background: color
        }
    }
}

export const textColor = (name: string, alpha?: number) => {
    const color = getColor(name, alpha)
    return {
        style: {
            color: color
        }
    }
}

export const getColor = (name: string, alpha?: number) => {
    let color = uniqolor(name).color
    if(alpha) {
        const uniqcolor = uniqolor(name, {format: "rgb"}).color.replace("rgb(", "").replace(")", "").split(",")
        color = rgba(Number(uniqcolor.at(0)), Number(uniqcolor.at(1)), Number(uniqcolor.at(2)), alpha)
    }

    return color
}