import {NextRequest, NextResponse} from "next/server";

export const hasContentType = (req: NextRequest) => {
    if (!req.headers.get('Content-Type')?.includes('application/json')) {
        return NextResponse.json({ message: 'Unsupported Content-Type' }, { status: 400 });
    }
}