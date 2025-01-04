interface AdvanceCalculator {
    minSalary: number;
    maxSalary: number;
    minMSC: number;
    maxMSC: number;
    mscStep: number;
    regularEmployeeRate: number;
    regularEmployerRate: number;
    ecThreshold: number;
    ecLowRate: number;
    ecHighRate: number;
    wispThreshold: number;
}

export const advanceCalculator = (monthlySalary: number, data: AdvanceCalculator) => {
    const {
        minSalary,
        maxSalary,
        minMSC,
        maxMSC,
        mscStep,
        regularEmployeeRate,
        regularEmployerRate,
        ecThreshold,
        ecLowRate,
        ecHighRate,
        wispThreshold
    } = {
        minSalary: Number(data.minSalary),
        maxSalary: Number(data.maxSalary),
        minMSC: Number(data.minMSC),
        maxMSC: Number(data.maxMSC),
        mscStep: Number(data.mscStep),
        regularEmployeeRate: Number(data.regularEmployeeRate),
        regularEmployerRate: Number(data.regularEmployerRate),
        ecThreshold: Number(data.ecThreshold),
        ecLowRate: Number(data.ecLowRate),
        ecHighRate: Number(data.ecHighRate),
        wispThreshold: Number(data.wispThreshold),
    };

    // console.log("Salary: ", monthlySalary)
    // console.log("Data: ", data)
    // Find MSC based on salary range
    let msc: number;
    if (monthlySalary < minSalary) {
        msc = minMSC
    } else if (monthlySalary > maxSalary) {
        msc = maxMSC
    } else {
        msc = Math.round(monthlySalary / mscStep) * mscStep
    }
    // if(monthlySalary < minSalary && monthlySalary > maxSalary) {
    //     if (monthlySalary > minSalary) {
    //         msc = minMSC;
    //     } else{
    //         msc = maxMSC;
    //     }
    // } else {
    //     msc = Math.round(monthlySalary / mscStep) * mscStep;
    // }

    // Calculate regular contributions
    const baseAmount = Math.min(msc, wispThreshold);
    const employeeShare = baseAmount * (regularEmployeeRate / 100);
    const employerShare = baseAmount * (regularEmployerRate / 100);

    // Calculate EC
    const ecShare = msc <= ecThreshold ? ecLowRate : ecHighRate;

    // Calculate WISP
    let wispEmployee = 0;
    let wispEmployer = 0;
    if (msc > wispThreshold) {
        const excess = msc - wispThreshold;
        wispEmployee = excess * (regularEmployeeRate / 100);
        wispEmployer = excess * (regularEmployerRate / 100);
    }

    // Calculate total
    const total = employeeShare + employerShare + ecShare + wispEmployee + wispEmployer;

    return {
        msc,
        employeeShare,
        employerShare,
        ecShare,
        wispEmployee,
        wispEmployer,
        total
    };
};
