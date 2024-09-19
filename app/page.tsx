import { redirect } from "next/navigation";
import Login from "@/components/login/Login";
import { auth } from "@/auth";

export default async function Home() {
    return (
        <main className="flex h-screen flex-col items-center">
            <Login />
        </main>
    );
}
