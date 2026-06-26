import pdfParse from 'pdf-parse';

export async function parsePDF(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('PDF parser expected a file buffer.');
  }

  const result = await pdfParse(buffer);
  return (result?.text || '').trim();
}
