const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const authenticateToken = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs allowed'));
  },
});

router.post('/notes/:noteId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'notes-app', resource_type: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    await prisma.note.update({
      where: { id: noteId },
      data: { fileUrl: result.secure_url, fileName: req.file.originalname },
    });

    res.json({ success: true, fileUrl: result.secure_url, fileName: req.file.originalname });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.delete('/notes/:noteId/file', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.note.update({
      where: { id: noteId },
      data: { fileUrl: null, fileName: null },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
