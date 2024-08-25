import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import path from 'path';

// Disable Next.js built-in body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

const parseForm = async (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
    const form = new IncomingForm({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        filename: (name, ext, part) => {
            return `${Date.now()}_${part.originalFilename}`;
        },
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                resolve({ fields, files });
            }
        });
    });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { fields, files } = await parseForm(req);
        res.status(200).json({ message: 'File uploaded successfully', files });
    } catch (err) {
        console.error('Error parsing form:', err);
        res.status(500).json({ message: 'Error parsing the file', error: err });
    }
};

export default handler;