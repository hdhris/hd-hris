import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import authOptions from "../app/auth/authOption";
import { LoginValidation } from "@/helper/zodValidation/LoginValidation";

// Mock the LoginValidation.parseAsync function
jest.mock("@/helper/zodValidation/LoginValidation", () => ({
    LoginValidation: {
        parseAsync: jest.fn() as jest.MockedFunction<typeof LoginValidation.parseAsync>,
    },
}));

describe("NextAuth Credentials Provider", () => {
    const { parseAsync } = LoginValidation;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should authenticate a valid user", async () => {
        const mockUsername = "admin";
        const mockPassword = "adminadmin";

        // Mocking LoginValidation.parseAsync to return valid credentials
        (parseAsync as jest.MockedFunction<typeof parseAsync>).mockResolvedValue({ username: mockUsername, password: mockPassword });

        const credentials = { username: mockUsername, password: mockPassword };
        const user = await authOptions.providers[0].options.authorize!(credentials, {} as any);

        expect(user).toEqual({
            isAdmin: true,
            picture: "https://avatars.githubusercontent.com/u/30373425?v=4",
            role: "HR Manager",
            id: "1",
            name: "John Doe",
        });
    });

    it("should throw error for invalid user", async () => {
        const mockUsername = "invalid";
        const mockPassword = "invalidpassword";

        // Mocking LoginValidation.parseAsync to return invalid credentials
        (parseAsync as jest.MockedFunction<typeof parseAsync>).mockResolvedValue({ username: mockUsername, password: mockPassword });

        const credentials = { username: mockUsername, password: mockPassword };

        await expect(authOptions.providers[0].options.authorize!(credentials, {} as any)).rejects.toThrow('Invalid Account');
    });

    it("should throw error for empty fields", async () => {
        const credentials = { username: "", password: "" };

        await expect(authOptions.providers[0].options.authorize!(credentials, {} as any)).rejects.toThrow('Fields cannot be empty');
    });
});

