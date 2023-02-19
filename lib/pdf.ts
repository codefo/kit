import { PDFExtract } from 'pdf.js-extract';

export function parseFile(path: string) {
  const pdfExtract = new PDFExtract();

  return new Promise((resolve, reject) => {
    pdfExtract.extract(path, {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
