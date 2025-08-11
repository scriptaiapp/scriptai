import { z } from "zod";
export declare const loginUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    newPassword: z.ZodString;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    confirmNewPassword: string;
}, {
    newPassword: string;
    confirmNewPassword: string;
}>, {
    newPassword: string;
    confirmNewPassword: string;
}, {
    newPassword: string;
    confirmNewPassword: string;
}>;
export declare const registerUserSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>;
//# sourceMappingURL=schema.d.ts.map