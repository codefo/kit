const { PDFExtract } = require('pdf.js-extract');

function parseFile(path) {
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

module.exports = {
  parseFile,
};
