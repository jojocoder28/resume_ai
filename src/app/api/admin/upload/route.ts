import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// We need to disable the default body parser to stream files with multer
export const config = {
  api: {
    bodyParser: false,
  },
};

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = upload.single('file');

// Helper to run middleware
function runMiddleware(req: NextRequest, middleware: any): Promise<any> {
    const requestWithBody = req as any; // Cast to access original request-like object for multer
    return new Promise((resolve, reject) => {
        middleware(requestWithBody, new NextResponse(), (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// Function to upload a buffer to Cloudinary
const handleUpload = (buffer: Buffer): Promise<{secure_url: string}> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'resume-templates' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        Readable.from(buffer).pipe(uploadStream);
    });
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const result = await handleUpload(buffer);

    return NextResponse.json({ url: result.secure_url });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
