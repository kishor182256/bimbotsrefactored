import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import PdfReader from '../PdfReader/PDFReader';

import styles from './index.module.scss';
import { handleResize, initCanvas, resizeCanvas } from '../../functions/utilFunctions';

let mouseDown = false;

const options = {
  currentMode: '',
  currentColor: '#000000',
  currentWidth: 5,
  fill: false,
  group: {},
};

const MainBoard = ({ aspectRatio = 4 / 3 }) => {
  const [canvas, setCanvas] = useState(null);
  const [fileReaderInfo, setFileReaderInfo] = useState({
    file: '',
    totalPages: null,
    currentPageNumber: 1,
    currentPage: '',
  });

  const [drawnLines, setDrawnLines] = useState([]);

  const canvasRef = useRef(null);
  const mainboardRef = useRef(null);

  useEffect(() => {
    if (!canvas && canvasRef.current) {
      const canvas = initCanvas(
        mainboardRef.current.clientWidth,
        mainboardRef.current.clientWidth / aspectRatio,
      );
      setCanvas(() => canvas);

      handleResize(resizeCanvas(canvas, mainboardRef.current)).observe(mainboardRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvas) {
      const center = canvas.getCenter();
      fabric.Image.fromURL(fileReaderInfo.currentPage, (img) => {
        img.scaleToHeight(canvas.height);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          top: center.top,
          left: center.left,
          originX: 'center',
          originY: 'center',
        });

        canvas.renderAll();
      });
    }
  }, [fileReaderInfo.currentPage]);

  function onFileChange(event) {
    updateFileReaderInfo({ file: event.target.files[0], currentPageNumber: 1 });
  }

  function updateFileReaderInfo(data) {
    setFileReaderInfo({ ...fileReaderInfo, ...data });
  }

  function createLine(canvas) {
    let currentLine = null;

    canvas.on('mouse:down', (event) => {
      mouseDown = true;
      let pointer = canvas.getPointer(event.e);

      const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: options.currentWidth,
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
      mouseDown = false;
      setDrawnLines((prevLines) => [...prevLines, currentLine]);
    });
  }

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
        </div>
      </div>
      <div>
        {drawnLines.map((drawnLine, index) => (
          <div key={index}>
            <p>
              Line {index + 1}: Start Point ({drawnLine.startText.text}), End Point (
              {drawnLine.endText.text})
            </p>
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} id="canvas" />
      <div>
        <PdfReader fileReaderInfo={fileReaderInfo} updateFileReaderInfo={updateFileReaderInfo} />
      </div>
    </div>
  );
};

export default MainBoard;
