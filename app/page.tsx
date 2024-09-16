import {redirect} from "next/navigation";
import Login from "@/components/login/Login";
import {auth} from "@/auth";

export default async function Home() {
    const session = await auth()
    // const user-session = await getServerSession(authOption);
    if (session) {
        if (session.user.role === 'admin') {
            redirect('/dashboard')
        } else if (session.user.role === 'employee') {
            redirect('/')
        }
    }
    return (<main className="flex h-screen flex-col items-center">
        <Login/>
    </main>);
}