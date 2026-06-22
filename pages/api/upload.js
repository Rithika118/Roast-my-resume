
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
