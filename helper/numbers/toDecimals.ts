import {Decimal} from "@prisma/client/runtime/library";

export function toDecimals(number: Decimal, decimals?: number) {
    return Number(new Decimal(number.toFixed(decimals || 2)))
}