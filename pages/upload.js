import formidable from 'formidable';
import { readFile, unlink } from 'fs/promises';
import path from 'path';
import { parsePDF } from '../../lib/pdfParser';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export const config = {
  api: {
    bodyParser: false,
  },
};

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function getFirstFile(files) {
  const fileEntry = files.file || files.pdf || files.resume || Object.values(files)[0];

  if (Array.isArray(fileEntry)) {
    return fileEntry[0];
  }

  return fileEntry;
}

function isPdfUpload(file, buffer) {
  const extension = path.extname(file.originalFilename || '').toLowerCase();
  const mimeType = (file.mimetype || '').toLowerCase();
  const hasPdfMetadata = extension === '.pdf' || mimeType === 'application/pdf';
  const hasPdfSignature = buffer.subarray(0, 4).toString('utf8') === '%PDF';

  return hasPdfMetadata && hasPdfSignature;
}

function parseForm(req) {
  const form = formidable({
    maxFiles: 1,
    maxFileSize: MAX_UPLOAD_SIZE,
    maxTotalFileSize: MAX_UPLOAD_SIZE,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

function isTooLargeError(error) {
  return (
    error?.code === formidable.errors?.biggerThanMaxFileSize ||
    error?.code === formidable.errors?.maxTotalFileSizeExceeded ||
    /max.*file.*size|larger than/i.test(error?.message || '')
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Only POST uploads are supported.');
  }

  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return sendError(res, 400, 'Upload a PDF file using multipart/form-data.');
  }

  let uploadedFile;

  try {
    const { files } = await parseForm(req);
    uploadedFile = getFirstFile(files);

    if (!uploadedFile) {
      return sendError(res, 400, 'No PDF file was uploaded.');
    }

    if (uploadedFile.size > MAX_UPLOAD_SIZE) {
      return sendError(res, 413, 'PDF upload must be 5MB or smaller.');
    }

    const buffer = await readFile(uploadedFile.filepath);

    if (!isPdfUpload(uploadedFile, buffer)) {
      return sendError(res, 400, 'Uploaded file must be a valid PDF.');
    }

    const text = await parsePDF(buffer);

    if (!text) {
      return sendError(res, 422, 'Could not extract readable text from this PDF.');
    }

    return res.status(200).json({ text });
  } catch (error) {
    if (isTooLargeError(error)) {
      return sendError(res, 413, 'PDF upload must be 5MB or smaller.');
    }

    console.error('PDF upload failed:', error);
    return sendError(res, 500, 'Unable to process the uploaded PDF. Please try again.');
  } finally {
    if (uploadedFile?.filepath) {
      await unlink(uploadedFile.filepath).catch(() => {});
    }
  }
}
