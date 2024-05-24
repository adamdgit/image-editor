import { add_canvas_history } from "./addCanvasHistory.js";
import { tool_size, current_tool } from "../canvas.js";
import { canvasHeight, canvasWidth } from "../canvas.js";
import { current_color } from "../canvas.js";
import { bucket_fill } from "./bucketFill.js"

const hide_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 400c-75.9 0-137.3-58.7-142.9-133.1L72.2 185.8c-13.8 17.3-26.5 35.6-36.7 55.6a32.4 32.4 0 0 0 0 29.2C89.7 376.4 197.1 448 320 448c26.9 0 52.9-4 77.9-10.5L346 397.4a144.1 144.1 0 0 1 -26 2.6zm313.8 58.1l-110.6-85.4a331.3 331.3 0 0 0 81.3-102.1 32.4 32.4 0 0 0 0-29.2C550.3 135.6 442.9 64 320 64a308.2 308.2 0 0 0 -147.3 37.7L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9l588.4 454.7a16 16 0 0 0 22.5-2.8l19.6-25.3a16 16 0 0 0 -2.8-22.5zm-183.7-142l-39.3-30.4A94.8 94.8 0 0 0 416 256a94.8 94.8 0 0 0 -121.3-92.2A47.7 47.7 0 0 1 304 192a46.6 46.6 0 0 1 -1.5 10l-73.6-56.9A142.3 142.3 0 0 1 320 112a143.9 143.9 0 0 1 144 144c0 21.6-5.3 41.8-13.9 60.1z"/></svg>'
const remove_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.7 23.7 0 0 0 -21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0 -16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>'
const canvasLayers = document.querySelector('.canvas-layers');

// Adds new canvas and layer element with matching id's
export function add_new_layer(ctx, layerWrapper) {
  const layerId = layerWrapper.children.length;
  const newLayer = document.createElement('div');

  if (layerId === 0) {
    newLayer.classList.add('current-layer')
  }

  // layer id's match the layer to the canvas
  newLayer.dataset.layerId = layerId;
  newLayer.classList.add("layer");
  newLayer.innerHTML = `
    <button class='hide-layer-btn'>${hide_svg}</button> 
      <span class='layer-text'>Layer ${layerId}</span> 
    <button class='delete-layer-btn'>${remove_svg}</button>
  `;

  // add listeners to each new layer
  newLayer.addEventListener('click', (e) => update_selected_layer(e, layerWrapper, ctx));
  layerWrapper.appendChild(newLayer);

  // create new canvas
  const newCanvas = document.createElement('canvas');
  newCanvas.dataset.layerId = layerId;
  newCanvas.height = canvasHeight;
  newCanvas.width = canvasWidth;
  newCanvas.style.pointerEvents = 'none';

  if (layerId === 0) {
    newCanvas.classList.add('active-layer');
    newCanvas.style.pointerEvents = 'all';
  }

  newCanvas.addEventListener('pointerdown', e => handlePointerDown(e, current_tool, ctx));
  canvasLayers.prepend(newCanvas);
}


// Updates the CTX to the selected canvas
function update_selected_layer(e, layerWrapper, ctx) {
  // add and remove selected class
  [...layerWrapper.children].forEach(layer => {
    layer.classList.remove('current-layer');
  });
  e.target.classList.add('current-layer');

  // remove pointer events for all children except the selected canvas
  [...canvasLayers.children].forEach(canvas => {
    // set all canvas ctx fill styles
    canvas.getContext("2d", { willReadFrequently: true }).fillStyle 
    = `rgb(${current_color[0]} ${current_color[1]} ${current_color[2]})`;

    if (canvas.dataset.layerId === e.target.dataset.layerId) {
      canvas.classList.add('active-layer');
      canvas.style.pointerEvents = 'all';
      // switch context whenever we select a new layer to be the default
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    } else {
      canvas.classList.remove('active-layer');
      canvas.style.pointerEvents = 'none';
    }
  });
}


function handlePointerDown(e, current_tool, ctx) {
  [...canvasLayers.children].forEach(canvas => {
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
  });

  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY, ctx);
  else if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY, ctx);
  else if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY, ctx);

  else if (current_tool === "bucket") {
    const { data } = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    if (data.join("") === current_color.join("")) return
    bucket_fill(e.offsetY, e.offsetX, data);
  }
}

// handles tool drawing to canvas
function handlePointerMove(e) {
  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY, ctx);
  else if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY, ctx);
  else if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY, ctx);
}

// remove all event listeners for pointer move on pointer up
function handlePointerUp() {
  [...canvasLayers.children].forEach(canvas => {
    canvas.removeEventListener('pointermove', handlePointerMove);
  });

  // add undo point after mouseup
  add_canvas_history(ctx);
}


function use_brush(x, y, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, tool_size, 0, 2 * Math.PI);
  ctx.fill();
}

function use_pencil(x, y, ctx) {
  ctx.fillRect(x - (tool_size / 2), y - (tool_size / 2), tool_size, tool_size);
}

function use_eraser(x, y, ctx) {
  ctx.clearRect(x - (tool_size / 2), y - (tool_size / 2), tool_size, tool_size);
}