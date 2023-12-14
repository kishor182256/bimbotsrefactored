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

export function resizeCanvas(canvas, mainboard) {
  return () => {
    const ratio = canvas.getWidth() / canvas.getHeight();
    const mainboardWidth = mainboard.clientWidth;

    const scale = mainboardWidth / canvas.getWidth();
    const zoom = canvas.getZoom() * scale;
    canvas.setDimensions({ width: mainboardWidth, height: mainboardWidth / ratio });
    canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
  };
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

export function createLine(canvas) {
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
