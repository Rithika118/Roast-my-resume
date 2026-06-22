import { PDFParse } from 'pdf-parse';

export async function parsePDF(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('PDF parser expected a file buffer.');
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return (result?.text || '').trim();
  } finally {
    await parser.destroy();
  }
}
