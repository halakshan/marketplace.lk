import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — files held in buffer, uploaded directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload/images  — upload up to 8 images
router.post('/images', verifyToken, (req: Request, res: Response, next: any) => {
  upload.array('images', 8)(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    // Upload all files to Cloudinary in parallel
    const uploads = files.map(file =>
      new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `ads/${req.user!.uid}`,
            transformation: [
              { width: 1280, crop: 'limit' },   // max width 1280px
              { quality: 'auto:good' },           // auto quality
              { fetch_format: 'auto' },           // serve webp/avif when supported
            ],
          },
          (err, result) => {
            if (err || !result) return reject(err || new Error('Upload failed'));
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      })
    );

    const urls = await Promise.all(uploads);
    res.json({ success: true, urls });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

export default router;
