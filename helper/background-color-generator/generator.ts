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

export const gradientColor = (name: string, secondaryName: string, alpha: number = 1) => {
    const primaryColor = getColor(name, alpha);
    const secondaryColor = secondaryName ? getColor(secondaryName, alpha) : getColor(name, alpha * 0.5); // Default to a lighter shade if no secondary color is provided.

    return {
        style: {
            background: `linear-gradient(to bottom right, ${primaryColor} 0%, ${secondaryColor} 100%)`
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