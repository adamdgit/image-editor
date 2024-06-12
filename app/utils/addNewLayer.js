import { add_canvas_history } from "./addCanvasHistory.js";
import { use_bucket } from "./useBucket.js"
import { use_brush } from "./useBrush.js";
import { use_pencil } from "./usePencil.js";
import { use_eraser } from "./useEraser.js";
import { current_tool } from "../canvas2.js";

const hide_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 400c-75.9 0-137.3-58.7-142.9-133.1L72.2 185.8c-13.8 17.3-26.5 35.6-36.7 55.6a32.4 32.4 0 0 0 0 29.2C89.7 376.4 197.1 448 320 448c26.9 0 52.9-4 77.9-10.5L346 397.4a144.1 144.1 0 0 1 -26 2.6zm313.8 58.1l-110.6-85.4a331.3 331.3 0 0 0 81.3-102.1 32.4 32.4 0 0 0 0-29.2C550.3 135.6 442.9 64 320 64a308.2 308.2 0 0 0 -147.3 37.7L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9l588.4 454.7a16 16 0 0 0 22.5-2.8l19.6-25.3a16 16 0 0 0 -2.8-22.5zm-183.7-142l-39.3-30.4A94.8 94.8 0 0 0 416 256a94.8 94.8 0 0 0 -121.3-92.2A47.7 47.7 0 0 1 304 192a46.6 46.6 0 0 1 -1.5 10l-73.6-56.9A142.3 142.3 0 0 1 320 112a143.9 143.9 0 0 1 144 144c0 21.6-5.3 41.8-13.9 60.1z"/></svg>'
const remove_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.7 23.7 0 0 0 -21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0 -16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>'
const canvasLayers = document.querySelector('.canvas-layers');
let activeCanvas = document.querySelector(".active-canvas") || undefined;
let ctx = activeCanvas.getContext("2d", { willReadFrequently: true }) || undefined;

// Adds new canvas and layer element with matching id's
export function addNewLayer(layerWrapper) {
  const layerId = Date.now(); // random id using datetime
  const newLayer = document.createElement('div');

  if (layerWrapper.children.length === 0) {
    newLayer.classList.add('current-layer')
  }

  // layer id's match the layer to the canvas
  newLayer.dataset.layerId = layerId;
  newLayer.classList.add("layer");

  const hideBtn = document.createElement('button');
  hideBtn.classList.add('hide-layer-btn');
  hideBtn.innerHTML = hide_svg;
  hideBtn.addEventListener('click', (e) => hide_layer(e));

  const spanEl = document.createElement('span');
  spanEl.classList.add('layer-text');
  spanEl.innerHTML = `Layer ${layerWrapper.children.length +1}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-layer-btn');
  deleteBtn.innerHTML = remove_svg;
  deleteBtn.addEventListener('click', (e) => remove_layer(layerId));

  newLayer.appendChild(hideBtn);
  newLayer.appendChild(spanEl);
  newLayer.appendChild(deleteBtn);

  // add listeners to each new layer
  newLayer.addEventListener('click', (e) => update_selected_layer(e, layerWrapper));
  layerWrapper.appendChild(newLayer);

  // create new canvas
  const newCanvas = document.createElement('canvas');
  newCanvas.dataset.layerId = layerId;
  newCanvas.height = canvasHeight;
  newCanvas.width = canvasWidth;
  newCanvas.style.pointerEvents = 'none';

  if (layerWrapper.children.length === 1) {
    newCanvas.classList.add('active-canvas');
    newCanvas.style.pointerEvents = 'all';
    newCanvas.addEventListener('pointerdown', handlePointerDown);
    activeCanvas = newCanvas;
  }

  canvasLayers.prepend(newCanvas);
  add_canvas_history("add-new-layer");
}


// Updates the CTX to the selected canvas
function update_selected_layer(e, layerWrapper) {
  // add and remove selected class
  [...layerWrapper.children].forEach(layer => {
    layer.classList.remove('current-layer');
  });
  e.target.classList.add('current-layer');

  activeCanvas.removeEventListener('pointerdown', handlePointerDown);

  // remove pointer events for all children except the selected canvas
  [...canvasLayers.children].forEach(canvas => {
    if (canvas.dataset.layerId === e.target.dataset.layerId) {
      canvas.style.pointerEvents = 'all';
      canvas.classList.add("active-canvas");
      // switch context whenever we select a new layer to be the default
      ctx = canvas.getContext("2d", { willReadFrequently: true });
      activeCanvas = canvas;
      canvas.addEventListener('pointerdown', handlePointerDown);
    } else {
      // remove pointer events and event listeners for non selected layers
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.style.pointerEvents = 'none';
      canvas.classList.remove("active-canvas");
    }
  });
}

function handlePointerDown(e) {
  activeCanvas.addEventListener('pointermove', handlePointerMove);
  activeCanvas.addEventListener('pointerup', handlePointerUp);

  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY, ctx);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY, ctx);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY, ctx);
  if (current_tool === "bucket") use_bucket(e.offsetY, e.offsetX, ctx);
}

function handlePointerMove(e) {
  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY, ctx);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY, ctx);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY, ctx);
}

function handlePointerUp() {
  activeCanvas.removeEventListener('pointermove', handlePointerMove);
  // add undo point after mouseup
  add_canvas_history("canvas-edit");
}