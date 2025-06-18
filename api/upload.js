// API endpoint for file uploads - stores files in /uploads folder
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

const UPLOADS_DIR = './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new IncomingForm({
    uploadDir: UPLOADS_DIR,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
      return;
    }

    try {
      const file = files.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.originalFilename || 'unknown';
      const extension = path.extname(originalName);
      const baseName = path.basename(originalName, extension);
      const uniqueName = `${timestamp}_${baseName}${extension}`;
      const newPath = path.join(UPLOADS_DIR, uniqueName);

      // Move file to final location
      fs.renameSync(file.filepath, newPath);

      const result = {
        name: originalName,
        path: `/uploads/${uniqueName}`,
        url: `/uploads/${uniqueName}`,
        size: file.size,
        type: file.mimetype
      };

      res.status(200).json(result);
    } catch (error) {
      console.error('File processing error:', error);
      res.status(500).json({ error: 'File processing failed' });
    }
  });
}