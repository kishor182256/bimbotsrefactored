import React from 'react';
import { Document, Page,pdfjs} from 'react-pdf';
import styles from './index.module.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = ({ fileReaderInfo, updateFileReaderInfo }) => {
  function onRenderSuccess() {
    const importPDFCanvas = document.querySelector('.import-pdf-page canvas');
    const pdfAsImageSrc = importPDFCanvas.toDataURL();

    updateFileReaderInfo({ currentPage: pdfAsImageSrc });
  }

  function onDocumentLoadSuccess({ numPages }) {
    updateFileReaderInfo({ totalPages: numPages });
  }

  return (
    <div className={styles.pdfReader}>
      <div className={styles.fileContainer}>
        <Document
          className={styles.document}
          file={fileReaderInfo.file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadProgress={({ loaded, total }) =>
            console.log('Loading a document: ' + (loaded / total) * 100 + '%')
          }
        >
          <Page
            className="import-pdf-page"
            onRenderSuccess={onRenderSuccess}
            pageNumber={fileReaderInfo.currentPageNumber}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFReader;
