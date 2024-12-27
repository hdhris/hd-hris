import addressData from "../../components/common/forms/address/address.json";

type EmpName = {
    prefix?: string | null;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    extension?: string | null;
};

export function getEmpFullName(emp: EmpName | null) {
    if (!emp) {
        return ""; // Return an empty string if emp is null
    }

    const { prefix = "", first_name, last_name, middle_name = "", suffix = "", extension = "" } = emp;

    let formattedName = "";

    // Add the prefix if provided
    if (prefix) {
        formattedName += `${prefix} `;
    }

    // Start with last name and first name
    formattedName += `${last_name}, ${first_name}`;

    // Add the middle initial if middle name is provided
    if (middle_name) {
        formattedName += ` ${middle_name.charAt(0)}.`;
    }

    // Add the extension (like Jr., Sr.) if provided
    if (extension) {
        formattedName += ` ${extension}`;
    }

    // Add the suffix if provided
    if (suffix) {
        formattedName += ` ${suffix}`;
    }

    return formattedName;
}

type AddressType = {
    addr_region: number;
    addr_province: number;
    addr_municipal: number;
    addr_baranggay: number;
};

const addressCodeMap = new Map(addressData.map((addr) => [addr.address_code, addr]));
export function getFullAddress({ addr_region, addr_province, addr_municipal, addr_baranggay }: AddressType) {
    const region = addressCodeMap.get(addr_region)?.address_name;
    const province = addressCodeMap.get(addr_province)?.address_name;
    const municipal = addressCodeMap.get(addr_municipal)?.address_name;
    const baranggay = addressCodeMap.get(addr_baranggay)?.address_name;

    return `${baranggay}, ${municipal}, ${province}, ${region}`;
}
