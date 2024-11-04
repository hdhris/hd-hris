export const calcbuttons = [
  "C", "(", ")", "%",// "=",
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  ".", "0", "←", "+",
];

export function isNumeric(key: string):boolean{
    if(parseInt(key) || key==="0") return true
    
    return false
}

export const var_buttons = ["rate_p_hr", "shift_length", "payroll_days"];
