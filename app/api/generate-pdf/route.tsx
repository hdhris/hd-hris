import {NextResponse} from 'next/server'
import ReactPDF, {Document, Page, StyleSheet, Text, View} from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column', backgroundColor: '#ffffff', padding: 30,
    }, title: {
        fontSize: 24, marginBottom: 20,
    }, content: {
        fontSize: 12, lineHeight: 1.5,
    },
})

interface PDFTemplateProps {
    title: string
    content: string
}

function PDFTemplate({title, content}: PDFTemplateProps) {
    return (<Document>
            <Page size={{
                width: "5in",
                height: "5in"
            }} style={styles.page}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.content}>{content}</Text>
                </View>
            </Page>
        </Document>)
}

export async function POST(req: Request) {
    const {title, content} = await req.json()

    const pdfStream = await ReactPDF.renderToStream(<PDFTemplate title={title} content={content}/>)

    // const chunks: Uint8Array[] = []
    // for await (const chunk of pdfStream) {
    //     chunks.push(chunk)
    // }
    //
    // const pdfBuffer = Buffer.concat(chunks)

    return new NextResponse(pdfStream as unknown as ReadableStream, {
        headers: {
            'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${title}.pdf"`,
        },
    })
}

