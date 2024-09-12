import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    try {
        if(req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();
            if(data.type === 'delete') {
                return NextResponse.json({message: 'Deleted successfully'});
            } else if(data.type === 'sign out') {
                return NextResponse.json({message: 'Sign out successfully'});
            }
        }
        return NextResponse.error();
    } catch (e) {
        return NextResponse.json(e);
    }
}