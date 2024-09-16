import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {NewPasswordValidation} from "@/helper/zodValidation/NewPasswordValidation";

export const ChangeCredentialSchema = LoginValidation.merge(NewPasswordValidation).omit({
    password: true, current_password: true
}).refine(data => !data.username.toLowerCase().includes("admin") && !data.username.toLowerCase().includes(" "), {
    message: "Username cannot be used.", path: ["username"]
}).refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match", path: ["confirm_password"],
}).refine(data => !data.confirm_password.toLowerCase().includes("admin") && !data.confirm_password.toLowerCase().includes(" "), {
    message: "Password cannot be used.", path: ["confirm_password"]
})