import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import formidable from 'formidable';
import { parsePDF } from '../../lib/pdfParser';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function getFirstFile(files) {
  if (!files?.file) return null;
  return Array.isArray(files.file) ? files.file[0] : files.file;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Only POST uploads are supported.');
  }

  let uploadedFile = null;

  try {
    const uploadDir = path.join(os.tmpdir(), 'resume-roaster-uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: MAX_UPLOAD_SIZE,
      multiples: false,
    });

    const [, files] = await form.parse(req);
    uploadedFile = getFirstFile(files);

    if (!uploadedFile) {
      return sendError(res, 400, 'No PDF file was uploaded.');
    }

    if (uploadedFile.size > MAX_UPLOAD_SIZE) {
      return sendError(res, 413, 'PDF upload must be 5MB or smaller.');
    }

    const buffer = await fs.readFile(uploadedFile.filepath);
    const isPdf =
      uploadedFile.mimetype === 'application/pdf' ||
      buffer.subarray(0, 5).toString('ascii') === '%PDF-';

    if (!isPdf) {
      return sendError(res, 400, 'Uploaded file must be a valid PDF.');
    }

    const text = await parsePDF(buffer);

    if (!text) {
      return sendError(res, 422, 'Could not extract readable text from this PDF.');
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error('PDF upload failed:', error);
    return sendError(res, 500, 'Unable to process the uploaded PDF. Please try again.');
  } finally {
    if (uploadedFile?.filepath) {
      await fs.unlink(uploadedFile.filepath).catch(() => {});
    }
  }
}
