// API endpoint for file management
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = './uploads';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.path) {
          // Get specific file info
          const filePath = path.join(UPLOADS_DIR, req.query.path);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const fileInfo = {
              name: path.basename(req.query.path),
              path: `/uploads/${req.query.path}`,
              url: `/uploads/${req.query.path}`,
              size: stats.size,
              type: 'application/octet-stream' // Default type
            };
            res.status(200).json(fileInfo);
          } else {
            res.status(404).json({ error: 'File not found' });
          }
        } else {
          // Get all files
          if (!fs.existsSync(UPLOADS_DIR)) {
            res.status(200).json([]);
            return;
          }

          const files = fs.readdirSync(UPLOADS_DIR).map(filename => {
            const filePath = path.join(UPLOADS_DIR, filename);
            const stats = fs.statSync(filePath);
            return {
              name: filename,
              path: `/uploads/${filename}`,
              url: `/uploads/${filename}`,
              size: stats.size,
              type: 'application/octet-stream'
            };
          });
          res.status(200).json(files);
        }
        break;

      case 'DELETE':
        // Delete all files
        if (fs.existsSync(UPLOADS_DIR)) {
          const files = fs.readdirSync(UPLOADS_DIR);
          files.forEach(file => {
            fs.unlinkSync(path.join(UPLOADS_DIR, file));
          });
        }
        res.status(200).json({ message: 'All files deleted' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Files API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}