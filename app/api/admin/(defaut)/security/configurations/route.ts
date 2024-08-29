import {NextRequest, NextResponse} from "next/server";

export async function PUT(req: NextRequest) {
    try{
        if (req.headers.get('Content-Type')?.includes('application/json')) {
            const data = await req.json();


            //Save it to the database
            //INFO: The request of data is just like this:
            // {isOn: true, twoFASelection: "email", codes: ["619 681 9921", "854 029 6093", "437 717 7038"]}



            // response.headers.set('Content-Security-Policy', "default-src 'self'");
            // response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            // response.headers.set('X-Content-Type-Options', 'nosniff');
            // response.headers.set('X-Frame-Options', 'DENY');

            return NextResponse.json(data)

        }
    } catch (error) {
        console.log(error);
        return NextResponse.error()
    }
}