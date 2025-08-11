"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = exports.resetPasswordSchema = exports.loginUserSchema = void 0;
const zod_1 = require("zod");
exports.loginUserSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must not exceed 32 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, "Password must include uppercase, lowercase, number, and special character"),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must not exceed 32 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, "Password must include uppercase, lowercase, number, and special character"),
    confirmNewPassword: zod_1.z.string().nonempty("Confirm Password is required"),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords must match",
    path: ["confirmNewPassword"],
});
exports.registerUserSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must not exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must not exceed 32 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, "Password must include uppercase, lowercase, number, and special character"),
    confirmPassword: zod_1.z.string().nonempty("Confirm Password is required"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});
