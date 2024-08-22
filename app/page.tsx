
import {redirect} from "next/navigation";
import Login from "@/components/login/Login";
import Link from "next/link";
import {getServerSession} from "next-auth";
import authOption from "@/app/auth/authOption";

export default async function Home() {
    const session = await getServerSession(authOption);
    if(session){
        if(session.user.role === 'admin'){
            redirect('/dashboard')
        } else if(session.user.role === 'employee'){
            redirect('/')
        }
    }
    return (<main className="flex h-screen flex-col items-center">
        <Login/>
        </main>);
}