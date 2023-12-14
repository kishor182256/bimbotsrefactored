import { fabric } from 'fabric';

let drawInstance = null;
let mouseDown = false;

const options = {
  currentMode: '',
  currentColor: '#000000',
  currentWidth: 5,
  fill: false,
  group: {},
};

const modes = {
  LINE: 'LINE',
};

function stopDrawing() {
    mouseDown = false;
  }

function removeCanvasListener(canvas) {
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('mouse:wheel');
}

function handleLineClick(event) {
  console.log('Line Clicked:', event.target);
}



export function startAddLine(canvas, width) {
  return ({ e }) => {
    mouseDown = true;

    let pointer = canvas.getPointer(e);
    console.log('Start Drawing Line:', { x: pointer.x, y: pointer.y });
    drawInstance = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      strokeWidth: width,
      stroke: 'red',
      selectable: false,
    });
    drawInstance.on('mousedown', handleLineClick);

    canvas.add(drawInstance);
    canvas.requestRenderAll();
  };
}

export function startDrawingLine(canvas) {
  return ({ e }) => {
    if (mouseDown) {
      const pointer = canvas.getPointer(e);
      drawInstance.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      drawInstance.setCoords();

      canvas.requestRenderAll();
      console.log('End Drawing Line:', { x: pointer.x, y: pointer.y });
    }
  };
}

export const createLine=(canvas)=>{
  if (modes.currentMode !== modes.LINE) {
    options.currentMode = modes.LINE;

    removeCanvasListener(canvas);
    canvas.on('mouse:down', startAddLine(canvas));
    canvas.on('mouse:move', startDrawingLine(canvas));
    canvas.on('mouse:up', stopDrawing);
    // canvas.on('mouse:wheel', handleMouseWheel(canvas));

    canvas.selection = false;
    canvas.hoverCursor = 'auto';
    canvas.isDrawingMode = false;
    canvas.getObjects().map((item) => item.set({ selectable: false }));
    canvas.discardActiveObject().requestRenderAll();
  }
}


export const handleResize=(callback)=> {
  const resize_ob = new ResizeObserver(callback);
  return resize_ob;
}

export const resizeCanvas=(canvas, mainboard)=>{
  return () => {
    const ratio = canvas.getWidth() / canvas.getHeight();
    const mainboardWidth = mainboard.clientWidth;

    const scale = mainboardWidth / canvas.getWidth();
    const zoom = canvas.getZoom() * scale;
    canvas.setDimensions({ width: mainboardWidth, height: mainboardWidth / ratio });
    canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
  };
}


export const  initCanvas=(width, height)=> {
  const canvas = new fabric.Canvas('canvas', { height, width });
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerStyle = 'circle';
  fabric.Object.prototype.borderColor = '#4447A9';
  fabric.Object.prototype.cornerColor = '#4447A9';
  fabric.Object.prototype.cornerSize = 6;
  fabric.Object.prototype.padding = 10;
  fabric.Object.prototype.borderDashArray = [5, 5];

  canvas.on('object:added', (e) => {
    e.target.on('mousedown', removeObject(canvas));
  });
  canvas.on('path:created', (e) => {
    e.path.on('mousedown', removeObject(canvas));
  });

  return canvas;
}

function removeObject(canvas) {
  return (e) => {
    
  };
}