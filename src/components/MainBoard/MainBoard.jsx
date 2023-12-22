import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import PdfReader from '../PdfReader/PDFReader';
import { handleResize, initCanvas, resizeCanvas } from '../../functions/utilFunctions';
import styles from './index.module.scss';
import { distanceRatio, standardSizes } from '../../corninates/distancePoints';

let mouseDown = false;



const MainBoard = ({ aspectRatio = 4 / 3 }) => {
  const [canvas, setCanvas] = useState(null);
  const [fileReaderInfo, setFileReaderInfo] = useState({
    file: '',
    totalPages: null,
    currentPageNumber: 1,
    currentPage: '',
  });

  const [drawnLines, setDrawnLines] = useState([]);
  const [selectedPaperSize, setSelectedPaperSize] = useState('');
  const [selectedDistanceRatio, setSelectedDistanceRatio] = useState('1:10');

  const canvasRef = useRef(null);
  const mainboardRef = useRef(null);

  const onPaperSizeChange = (event) => {
    setSelectedPaperSize(event.target.value);
  };

  const onDistanceRatioChange = (event) => {
    setSelectedDistanceRatio(event.target.value);
  };

  useEffect(() => {
    if (!canvas && canvasRef.current) {
      const canvas = initCanvas(
        mainboardRef.current.clientWidth,
        mainboardRef.current.clientWidth / aspectRatio,
      );
      setCanvas(canvas);
      handleResize(resizeCanvas(canvas, mainboardRef.current)).observe(mainboardRef.current);
      const horizontalLine = new fabric.Line([0, canvas.height / 2, canvas.width, canvas.height / 2], {
        strokeWidth: 1,
        stroke: 'blue',
        selectable: false,
      });
      canvas.add(horizontalLine);
      const verticalLine = new fabric.Line([canvas.width / 2, 0, canvas.width / 2, canvas.height], {
        strokeWidth: 1,
        stroke: 'blue',
        selectable: false,
      });
      canvas.add(verticalLine);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvas) {
      const center = canvas.getCenter();
      canvas.clear(); 
  
      fabric.Image.fromURL(fileReaderInfo.currentPage, (img) => {
        img.scaleToHeight(canvas.height);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          top: center.top,
          left: center.left,
          originX: 'center',
          originY: 'center',
        });
        drawnLines.forEach((lineSet) => {
          canvas.add(lineSet.line, lineSet.startText, lineSet.endText);
        });
  
        canvas.renderAll();
      });
      
  
      const horizontalLine = new fabric.Line([0, canvas.height / 2, canvas.width, canvas.height / 2], {
        strokeWidth: 1,
        stroke: 'blue',
        selectable: false,
      });
      const verticalLine = new fabric.Line([canvas.width / 2, 0, canvas.width / 2, canvas.height], {
        strokeWidth: 1,
        stroke: 'blue',
        selectable: false,
      });
  
      canvas.add(horizontalLine, verticalLine);
    }
  }, [fileReaderInfo.currentPage, selectedPaperSize]);
  


  useEffect(() => {
    if (canvas) {
      canvas.on('mouse:wheel', (event) => {
        const delta = event.e.deltaY;
        let zoom = canvas.getZoom();
        zoom = zoom + delta / 1000;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;
        canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
        event.e.preventDefault();
        event.e.stopPropagation();
      });
    }
  }, [canvas]);

  function onFileChange(event) {
    updateFileReaderInfo({ file: event.target.files[0], currentPageNumber: 1 });
  }

  function updateFileReaderInfo(data) {
    setFileReaderInfo((prevInfo) => ({ ...prevInfo, ...data }));
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      mouseDown = false;
    }
  };

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('keydown', onKeyDown);
    };
    return cleanup;
  }, []);

  function createLine(canvas) {
    let currentLine = null;
    document.addEventListener('keydown', onKeyDown);

    canvas.on('mouse:down', (event) => {
      mouseDown = true;
      let pointer = canvas.getPointer(event.e);

      const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: 5, 
        stroke: 'red',
        selectable: false,
      });

      const startText = new fabric.Text(`(${pointer.x}, ${pointer.y})`, {
        left: pointer.x,
        top: pointer.y,
        fontSize: 12,
        selectable: false,
      });

      const endText = new fabric.Text(`(${pointer.x}, ${pointer.y})`, {
        left: pointer.x,
        top: pointer.y,
        fontSize: 12,
        selectable: false,
      });

      currentLine = { line, startText, endText };

      canvas.add(line, startText, endText);
      canvas.requestRenderAll();
    });

    canvas.on('mouse:move', (event) => {
      if (mouseDown) {
        const pointer = canvas.getPointer(event.e);

        currentLine.line.set({
          x2: pointer.x,
          y2: pointer.y,
        });

        currentLine.endText.set({
          left: pointer.x,
          top: pointer.y,
          text: `(${pointer.x}, ${pointer.y})`,
        });

        canvas.requestRenderAll();
      }
    });

    canvas.on('mouse:up', () => {
      mouseDown = true;
      setDrawnLines((prevLines) => [...prevLines, currentLine]);
    });
  }




  // const calculateScale = () => {
  //   if (canvas && fileReaderInfo.currentPage && selectedPaperSize) {
  //     const pdfWidth = canvas.backgroundImage.width;
  //     const pdfHeight = canvas.backgroundImage.height;

  //     let paperSize = 'Unknown';
  //     let targetWidth, targetHeight;

  //     standardSizes.forEach((size) => {
  //       if (size.name === selectedPaperSize) {
  //         paperSize = size.name;
  //         targetWidth = size.width * 72; 
  //         targetHeight = size.height * 72;
  //       }
  //     });

  //     if (targetWidth && targetHeight) {
  //       const scaleX = targetWidth / pdfWidth;
  //       const scaleY = targetHeight / pdfHeight;

  //       canvas.setZoom(Math.min(scaleX, scaleY));
  //       canvas.renderAll();
  //     } else {
  //       alert('Invalid paper size selected.');
  //     }
  //   }
  // };

  const calculateScale = () => {
    if (canvas && fileReaderInfo.currentPage && selectedPaperSize) {
      const pdfWidth = canvas.backgroundImage.width;
      const pdfHeight = canvas.backgroundImage.height;

      let paperSize = 'Unknown';
      let targetWidth, targetHeight;

      standardSizes.forEach((size) => {
        if (size.name === selectedPaperSize) {
          paperSize = size.name;
          targetWidth = size.width * 72;
          targetHeight = size.height * 72;
        }
      });

      let distanceRatioParts = selectedDistanceRatio.split(':');
      let distanceScale = parseFloat(distanceRatioParts[1]) / parseFloat(distanceRatioParts[0]);

      if (targetWidth && targetHeight) {
        const scaleX = (targetWidth / pdfWidth) * distanceScale; 
        const scaleY = (targetHeight / pdfHeight) * distanceScale;

        canvas.setZoom(Math.min(scaleX, scaleY));
        canvas.renderAll();
      } else {
        alert('Invalid paper size selected.');
      }
    }
  };

  return (
    <div ref={mainboardRef} className={styles.mainboard}>
      <div className={styles.toolbar}>
        <div className={styles.header}>
          <label htmlFor="fileInput">
            <div className={styles.inputbutton}>
              <span>Upload PDF</span>
              <input type="file" id="fileInput" onChange={onFileChange} />
            </div>
          </label>
          <button type="button" onClick={() => createLine(canvas)} disabled={!fileReaderInfo.file}>
            Line
          </button>
          <select value={selectedPaperSize} onChange={onPaperSizeChange}>
            <option value="">Select Paper Size</option>
            {standardSizes.map((size) => (
              <option key={size.name} value={size.name}>
                {size.name}
              </option>
            ))}
          </select>
          <select value={selectedDistanceRatio} onChange={onDistanceRatioChange}> 
            {distanceRatio.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
          <button type="button" onClick={calculateScale} disabled={!fileReaderInfo.file}>
            Scale
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} id="canvas" />
      <div>
        <PdfReader
          fileReaderInfo={fileReaderInfo}
          fabric={fabric}
          canvas={canvas}
          updateFileReaderInfo={updateFileReaderInfo}
          selectedPaperSize={selectedPaperSize}
        />
      </div>
    </div>
  );
};

export default MainBoard;
