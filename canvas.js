// canvas elements
const currentLayer = document.querySelector('.active-layer');
const canvasLayers = document.querySelector('.canvas-layers');
let selected_canvas;
let ctx;
let canvasHeight = 500;
let canvasWidth = 500;

// top toolbar
const fileIn = document.getElementById('imgInp');
const colorPicker = document.getElementById("colorpicker");
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');
const brushSizeButton = document.querySelector('.brushsize');
const brushToolbar = document.querySelector('.toolbar-brushsize');
const showEditBtn = document.querySelector('.show-edit-dropdown');
const dropdown = document.querySelector('.dropdown');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
const resizeCanvasBtn = document.querySelector('.resize-canvas-btn')

// side toolbar
const toolbarLeft = document.querySelector('.toolbar-left');
const gsButton = document.querySelector('.gs-button');
const sepiaButton = document.querySelector('.sepia-button');
const mirrorHButtonH = document.querySelector('.mirrorh-button');
const mirrorHButtonV = document.querySelector('.mirrorv-button');
const bucketButton = document.querySelector('.bucket-button');
const brushButton = document.querySelector('.brush-button');
const pencilButton = document.querySelector('.pencil-button');
const eraserButton = document.querySelector('.eraser-button');
const addLayerButton = document.querySelector('.add-layer-btn');
const layerWrapper = document.querySelector('.layers-wrap');

// default options
widthInput.value = canvasWidth;
heightInput.value = canvasHeight;
const tools = ["brush", "pencil", "eraser", "bucket"];
let current_tool = tools[0];
let current_color = [0, 0, 0, 255];
let tool_size = 10;
const hide_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 400c-75.9 0-137.3-58.7-142.9-133.1L72.2 185.8c-13.8 17.3-26.5 35.6-36.7 55.6a32.4 32.4 0 0 0 0 29.2C89.7 376.4 197.1 448 320 448c26.9 0 52.9-4 77.9-10.5L346 397.4a144.1 144.1 0 0 1 -26 2.6zm313.8 58.1l-110.6-85.4a331.3 331.3 0 0 0 81.3-102.1 32.4 32.4 0 0 0 0-29.2C550.3 135.6 442.9 64 320 64a308.2 308.2 0 0 0 -147.3 37.7L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9l588.4 454.7a16 16 0 0 0 22.5-2.8l19.6-25.3a16 16 0 0 0 -2.8-22.5zm-183.7-142l-39.3-30.4A94.8 94.8 0 0 0 416 256a94.8 94.8 0 0 0 -121.3-92.2A47.7 47.7 0 0 1 304 192a46.6 46.6 0 0 1 -1.5 10l-73.6-56.9A142.3 142.3 0 0 1 320 112a143.9 143.9 0 0 1 144 144c0 21.6-5.3 41.8-13.9 60.1z"/></svg>';
const show_svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 576 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M572.5 241.4C518.3 135.6 410.9 64 288 64S57.7 135.6 3.5 241.4a32.4 32.4 0 0 0 0 29.2C57.7 376.4 165.1 448 288 448s230.3-71.6 284.5-177.4a32.4 32.4 0 0 0 0-29.2zM288 400a144 144 0 1 1 144-144 143.9 143.9 0 0 1 -144 144zm0-240a95.3 95.3 0 0 0 -25.3 3.8 47.9 47.9 0 0 1 -66.9 66.9A95.8 95.8 0 1 0 288 160z"/></svg>`
const remove_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.7 23.7 0 0 0 -21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0 -16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>';
// 0 = RGB values must match completely, higher means RGB values can vary to get better fill results
const fill_tolerance = 40;

// stores canvas image data for each action on a stack for undo/redo
const history = [];
const undone_history = [];


//------ CREATE INITIAL BLANK LAYER ------//
const initalLayer = add_new_layer();
const infoEl = initalLayer.querySelector('.layer-info');
selected_canvas = document.querySelector(`[data-layer-id='${initalLayer.dataset.layerId}']`);
ctx = selected_canvas.getContext('2d', { willReadFrequently: true });
update_selected_layer(infoEl);
add_history_event("add-new-layer", selected_canvas);
//----------------------------------------//

// top toolbar
fileIn.addEventListener('change', () => user_image_upload());
brushSizeButton.addEventListener('change', (e) => set_tool_size(e.target.value));
colorPicker.addEventListener('change', (e) => set_current_color(e));
undoButton.addEventListener('click', () => undo_history());
redoButton.addEventListener('click', () => redo_history());
showEditBtn.addEventListener('click', () => {
  if (dropdown.classList.contains('show-dropdown')) {
    dropdown.classList.remove('show-dropdown')
  } else {
    dropdown.classList.add('show-dropdown')
  }
});

// right toolbar
addLayerButton.addEventListener('click', () => {
  // creates a new canvas, gets the associated ID, to pass to history
  const newLayer = add_new_layer();
  const newCanvas = document.querySelector(`[data-layer-id='${newLayer.dataset.layerId}']`);
  add_history_event("add-new-layer", newCanvas)
})

// left toolbar
gsButton.addEventListener('click', () => filter_grayscale());
sepiaButton.addEventListener('click', () => filter_sepia());
mirrorHButtonH.addEventListener('click', () => mirror_image_horizontal());
mirrorHButtonV.addEventListener('click', () => mirror_image_vertical());

brushButton.addEventListener('click', (e) => update_selected_tool(e.target));
pencilButton.addEventListener('click', (e) => update_selected_tool(e.target));
eraserButton.addEventListener('click', (e) => update_selected_tool(e.target));
bucketButton.addEventListener('click', (e) => update_selected_tool(e.target));

// only visible when certain tools are selected such as brush or pencil
function set_tool_size(size) {
  if (size < 1) size = 1;
  tool_size = size;

  // also update the cursor size
  canvasLayers.style.cursor = create_custom_cursor(tool_size);
}

// Adds new canvas and layer element with matching id's
function add_new_layer(canvasData, id) {
  // when restoring old layers using undo, we pass the id to restore its original data
  // otherwise just use current timestamp as a unique ID
  let layerId = Date.now();
  if (id) layerId = id; 

  const newLayer = document.createElement('div');
  const btnsWrap = document.createElement('div');

  btnsWrap.classList.add('layer-btns-wrap')

  // create new canvas with same ID as layer
  const newCanvas = document.createElement('canvas');
  newCanvas.dataset.layerId = layerId;
  newCanvas.height = canvasHeight;
  newCanvas.width = canvasWidth;
  newCanvas.style.pointerEvents = 'none';

  // layer id's match the layer to the canvas
  newLayer.dataset.layerId = layerId;
  newLayer.classList.add("layer");

  // create children elements of new layer
  const hideBtn = document.createElement('button');
  hideBtn.classList.add('hide-layer-btn');
  hideBtn.dataset.show = "true";
  hideBtn.addEventListener('pointerenter', () => {
    hideBtn.dataset.show === 'true' ? hideBtn.innerHTML = hide_svg : hideBtn.innerHTML = show_svg;
  });
  hideBtn.addEventListener('pointerleave', () => {
    hideBtn.dataset.show === 'true' ? hideBtn.innerHTML = show_svg : hideBtn.innerHTML = hide_svg;
  });

  hideBtn.innerHTML = show_svg;
  hideBtn.addEventListener('click', () => toggle_hide_layer(hideBtn, layerId));

  const spanEl = document.createElement('span');
  spanEl.classList.add('layer-info');
  spanEl.innerHTML = `Layer`;
  spanEl.addEventListener('click', (e) => update_selected_layer(e.target));

  const divEl = document.createElement('div');
  divEl.classList.add('layer-preview');

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-layer-btn');
  deleteBtn.innerHTML = remove_svg;
  deleteBtn.addEventListener('click', () => {
    // can fail, as must always be 1
    if (remove_layer(layerId)) {
      add_history_event("delete-layer", newCanvas);
    }
  });

  btnsWrap.appendChild(hideBtn);
  btnsWrap.appendChild(deleteBtn);
  newLayer.appendChild(btnsWrap);
  spanEl.appendChild(divEl);
  newLayer.appendChild(spanEl);
  layerWrapper.appendChild(newLayer);

  // when restoring a deleted layer via undo actions, we pass the 
  // data from the deleted canvas, so it can be restored
  if (canvasData) newCanvas.getContext("2d").putImageData(canvasData, 0, 0);

  canvasLayers.prepend(newCanvas);
  return newLayer;
}

// hide layer by given id
function toggle_hide_layer(hideBtn, id) {
  // swap between hidden or shown
  hideBtn.dataset.show === "true" ? hideBtn.dataset.show = "false" : hideBtn.dataset.show = "true";
  const canvas = document.querySelector(`canvas[data-layer-id='${id}']`);
  canvas.style.display === "none" ? canvas.style.display = "block" : canvas.style.display = "none";
  const layerWrap = document.querySelector(`.layer[data-layer-id='${id}'] .layer-info`);
  hideBtn.dataset.show === "true" ? layerWrap.style.opacity = '1' : layerWrap.style.opacity = '.3'; 
}

// handles removing a layer by given ID, returns true if successful
function remove_layer(layerId) {
  // Must have atleast one canvas
  if (canvasLayers.children.length === 1) return false;

  // remove associated canvas by id match
  [...canvasLayers.children].forEach(canvas => {
    if (canvas.dataset.layerId === layerId.toString()) {
      canvas.remove();
      // removed canvas is the currently selected, must remove eventlisteners 
      if (selected_canvas.dataset.layerId === layerId) {
        selected_canvas.removeEventListener('pointerdown', handlePointerDown);
      }
    }
  });

  // remove layer element
  [...layerWrapper.children].forEach(layer => {
    if (layer.dataset.layerId === layerId.toString()) {
      layer.remove();
    }
  });

  return true;
}

// update tool size and create a custom svg for users cursor based on size
function create_custom_cursor(size) {
  // brush needs a circle svg cursor, eraser and pencil need square cursor
  const type = current_tool === "brush" ? "circle" : "square";

  let svg;
  if (type === "circle") {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
        <circle cx="${size}" cy="${size}" r="${size - 1}" fill="none" stroke="cyan" stroke-width="2" />
      </svg>
    `;
  }

  if (type === "square") {
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
        <rect x="${size / 2}" y="${size / 2}" width="${size}" height="${size}" fill="none" stroke="cyan" stroke-width="2" />
      </svg>
    `;
  }

  // Encode the SVG string to ensure it's correctly interpreted in the data URI
  const cursor = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}') ${size} ${size}, auto`;
  return cursor;
}

function handlePointerDown(e) {
  selected_canvas.addEventListener('pointermove', handlePointerMove);
  selected_canvas.addEventListener('pointerup', handlePointerUp);

  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY);
  if (current_tool === "bucket") use_bucket(e.offsetY, e.offsetX);
}

function handlePointerMove(e) {
  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY);
}

function handlePointerUp() {
  selected_canvas.removeEventListener('pointermove', handlePointerMove);
  // add undo point after mouseup
  add_history_event("canvas-edit", selected_canvas);
}


// Handle user uploaded images and draw to canvas
function user_image_upload() {
  const reader = new FileReader();
  const selectedFile = fileIn.files[0];
  const image = new Image();
  if (selectedFile) {
    reader.readAsDataURL(selectedFile)
    reader.onload = selectedFile => image.src = selectedFile.target.result;
    reader.onloadend = () => {
      // un-comment if you want to resize canvas to the uploaded image size
      // selected_canvas.height = image.height;
      // selected_canvas.width = image.width;
      ctx.drawImage(image, 0, 0, image.width, image.height)
      add_history_event("canvas-edit", selected_canvas);
    }
  }
}

// sets the colour of the tools to paint the canvas with (rgb)
function set_current_color(e) {
  const canvasLayers = document.querySelector('.canvas-layers');
  // convert hex to rgb
  const hex = e.target.value;
  current_color[0] = '0x' + hex[1] + hex[2] | 0
  current_color[1] = '0x' + hex[3] + hex[4] | 0
  current_color[2] = '0x' + hex[5] + hex[6] | 0
  current_color[3] = 255;
  
  // set all canvas context fillstyles to current color
  [...canvasLayers.children].forEach(canvas => {
    canvas.getContext("2d", { willReadFrequently: true }).fillStyle 
    = `rgb(${current_color[0]} ${current_color[1]} ${current_color[2]})`;
  })
}

function update_selected_tool(target) {
  highlight_selected_tool(target);
  let toolIndex = tools.indexOf(target.dataset.toolname);
  current_tool = tools[toolIndex];

  // update cursor to appropriate type
  if (current_tool === "bucket") {
    canvasLayers.style.cursor = 'crosshair';
    brushToolbar.style.display = 'none';
  } else {
    canvasLayers.style.cursor = create_custom_cursor(tool_size);
    brushToolbar.style.display = 'flex';
  }
}

// remove any highlited tools and highlight the selected one
function highlight_selected_tool(target) {
  [...toolbarLeft.children].forEach(button => {
      button.classList.remove('selected-tool')
  })
  target.classList.add('selected-tool');
}

// Updates the CTX to the selected canvas
function update_selected_layer(element) {
  if (document.querySelector('.current-layer')) {
    // swap current layer class to selected layer
    document.querySelector('.current-layer').classList.remove('current-layer');
  }
  element.classList.add('current-layer');

  if (document.querySelector('.active-layer')) {
    // swap active layer class
    document.querySelector('.active-layer').classList.remove('active-layer');
  }
  element.parentNode.classList.add('active-layer');

  // remove active canvas styles
  selected_canvas.removeEventListener('pointerdown', handlePointerDown);
  selected_canvas.style.pointerEvents = 'none';
  selected_canvas.classList.remove("active-canvas");

  // Id is stored in the layer wrapper parent element
  const layerId = element.parentNode.dataset.layerId;

  // remove pointer events for all children except the selected canvas
  const newActiveCanvas = document.querySelector(`[data-layer-id="${layerId}"]`);
  newActiveCanvas.style.pointerEvents = 'all';
  // switch context whenever we select a new layer to be the default
  ctx = newActiveCanvas.getContext("2d", { willReadFrequently: true });
  selected_canvas = newActiveCanvas;
  selected_canvas.addEventListener('pointerdown', handlePointerDown);
}

//----- undo history -----//
// undo history by reverting to previous top of stack state
function undo_history() {
  // history should always have default 1 item from creating inital canvas layer
  if (history.length === 1) return

  // remove most recent and save for redo
  const removedItem = history.pop();
  // check undone_history stack length
  if (undone_history.length > 29) {
    undone_history.shift();
  }
  undone_history.push(removedItem);

  if (removedItem.type === "canvas-edit") {
    // after removing the most recent item, we need to revert the canvas to the new
    // top of the history canvas state
    const prevState = history[history.length -1];
    const canvasByID = document.querySelector(`[data-layer-id='${prevState.id}']`);
    canvasByID.getContext("2d").putImageData(prevState.data, 0, 0);
  }

  if (removedItem.type === "add-new-layer") {
    remove_layer(removedItem.id);
  }
  // opposite action as undo
  if (removedItem.type === "delete-layer") {
    add_new_layer(removedItem.data, removedItem.id);
  }
  console.log("remove: ", history)
}

//----- redo history -----//
function redo_history() {
  // do nothing if no history to undo
  if (undone_history.length === 0) return

  // get top of the undone history
  const removedItem = undone_history.pop();

  // check history stack length
  if (history.length > 29) {
    history.shift();
  }
  history.push(removedItem);

  if (removedItem.type === "canvas-edit") {
    const canvasByID = document.querySelector(`[data-layer-id='${removedItem.id}']`);
    canvasByID.getContext("2d").putImageData(removedItem.data, 0, 0);
  }

  if (removedItem.type === "add-new-layer") {
    add_new_layer(removedItem.data, removedItem.id);
  }

  if (removedItem.type === "delete-layer") {
    remove_layer(removedItem.id);
  }
  console.log("add:", history)
}

//----- add to history stack -----//
// handles adding events to the history stack
function add_history_event(type, element) {
  if (history.length > 29) {
    history.shift();
  }

  if (type === "canvas-edit") {
    const currentctx = element.getContext("2d");
    const current = currentctx.getImageData(0, 0, canvasWidth, canvasHeight);
    history.push({
      type: type,
      data: current,
      id: element.dataset.layerId
    });
  }

  if (type === "add-new-layer") {
    console.log(element)
    const currentctx = element.getContext("2d");
    const current = currentctx.getImageData(0, 0, canvasWidth, canvasHeight);
    history.push({
      type: type,
      data: current,
      id: element.dataset.layerId
    });
  }

  if (type === "delete-layer") {
      // get canvas associated with deleted layer
      const deletedctx = element.getContext("2d");
      const deletedCanvasData = deletedctx.getImageData(0, 0, canvasWidth, canvasHeight);
      // remove_layer(element.dataset.layerId)
      history.push({
        type: type,
        data: deletedCanvasData,
        id: element.dataset.layerId
      });
  }
  console.log("add:", history)
}


function use_brush(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, tool_size, 0, 2 * Math.PI);
  ctx.fill();
}

function use_pencil(x, y) {
  ctx.fillRect(x - (tool_size / 2), y - (tool_size / 2), tool_size, tool_size);
}

function use_eraser(x, y) {
  ctx.clearRect(x - (tool_size / 2), y - (tool_size / 2), tool_size, tool_size);
}

//----- paint bucket fill -----//
// fills the selected area with a user selected colour
// Found super fast flood fill here: https://github.com/williammalone/HTML5-Paint-Bucket-Tool
function use_bucket(y, x) {
  const { data: selectedColor } = ctx.getImageData(x, y, 1, 1);
  // if selected pixel is the same as the current color, early return
  if (selectedColor.join("") === current_color.join("")) return;

  const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  const data = canvasData.data;

  // sometimes selected pixel x or y can be .5 ??
  x = Math.round(x);
  y = Math.round(y);

  const stack = [[x,y]];
  let index = (y * canvasWidth + x) * 4;

  while (stack.length > 0) {
    let [x , y] = stack.pop();
    index = (y * canvasWidth + x) * 4;

    while (y-- >= 0 && color_is_valid(selectedColor, data[index], data[index +1], data[index +2], data[index +3])) {
      index -= canvasWidth * 4;
    }
    index += canvasWidth * 4;
    y++;

    let hitLeft, hitRight = false;

    // start going down and colour valid pixels
    while(y++ < canvasHeight -1 && color_is_valid(selectedColor, data[index], data[index +1], data[index +2], data[index +3])) {
      // update pixel colours
      data[index] = current_color[0];    // r
      data[index +1] = current_color[1]; // g
      data[index +2] = current_color[2]; // b
      data[index +3] = 255;              // a

      if (x > 0) {
        // check left pixel is valid
        if (color_is_valid(selectedColor, data[index -4], data[index -4 +1], data[index -4 +2], data[index -4 +3])) {
          if (!hitLeft) {
            stack.push([x -1, y]);
            hitLeft = true;
          }
        } else if (hitLeft) {
          hitLeft = false;
        }
      }

      if (x < canvasWidth -1) {
        // check right pixel is valid
        if (color_is_valid(selectedColor, data[index +4], data[index +4 +1], data[index +4 +2], data[index +4 +3])) {
          if (!hitRight) {
            stack.push([x +1, y]);
            hitRight = true;
          }
        } else if (hitRight) {
          hitRight = false;
        }
      }
      index += canvasWidth * 4;
    }
  }

  ctx.putImageData(canvasData, 0, 0)
}

// return true or false if a pixel is valid to be flood filled
function color_is_valid(color, r, g, b, a) {
  return (
    r >= color[0] -fill_tolerance && r <= color[0] +fill_tolerance
    && g >= color[1] -fill_tolerance && g <= color[1] +fill_tolerance
    && b >= color[2] -fill_tolerance && b <= color[2] +fill_tolerance
    && a === color[3] // alpha should be equal
  )
}

//----- gray scale image -----//
// Turns the entire canvas gray-scale
function filter_grayscale() {
  const grayscaleImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  // skip every 4 values (rgba) boomer loops ftw
  for (let i = 0; i < grayscaleImage.data.length; i += 4) 
  { 
    // get average of rgb, set all rbg to the averaged value to create a grayscale image
    let gs = Math.ceil((grayscaleImage.data[i] + grayscaleImage.data[i + 1] + grayscaleImage.data[i + 2]) / 3)
    grayscaleImage.data[i] = gs; // r
    grayscaleImage.data[i + 1] = gs; // g
    grayscaleImage.data[i + 2] = gs; // b
    grayscaleImage.data[i + 3] = 255; // keep alpha as 255
  }

  ctx.putImageData(grayscaleImage, 0, 0);
  add_history_event("canvas-edit", selected_canvas);
}

//----- sepia tone image -----//
// Turns the entire canvas sepia tone
function filter_sepia() {
  const sepiaImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  // skip every 4 values (rgba) boomer loops ftw
  for (let i = 0; i < sepiaImage.data.length; i += 4) 
  { 
    let red = sepiaImage.data[i];
    let green = sepiaImage.data[i + 1];
    let blue = sepiaImage.data[i + 2];

    // sepia tone formula
    sepiaImage.data[i] = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue); // r
    sepiaImage.data[i + 1] = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue); // g
    sepiaImage.data[i + 2] = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue); // b
    sepiaImage.data[i + 3] = 255; // keep alpha as 255
  }

  ctx.putImageData(sepiaImage, 0, 0);
  add_history_event("canvas-edit", selected_canvas);
}

//----- mirror the image -----//
// flip or mirror the image horizontally
function mirror_image_horizontal() {
  const mirroredImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  
  // counts the current row we are swapping
  let count = 0;
  for (let i = 0, j = (canvasWidth - 1) * 4; count <= canvasHeight; i += 4, j -= 4) 
  { 
    // we have reached the middle of the image, reset i & j to next row
    if (i >= j) {
      count ++;
      i = (canvasWidth * count) * 4;
      j = ((canvasWidth * (count +1)) -1) * 4;
    }
    swap_pixels(mirroredImage.data, i, j);
  }

  ctx.putImageData(mirroredImage, 0, 0);
  add_history_event("canvas-edit", selected_canvas);
}

//----- mirror the image -----//
// flip or mirror the image vertically
function mirror_image_vertical() {
  const mirroredImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  
  // counts the current row we are swapping
  let count = 0;
  for (let i = 0, j = ((canvasHeight * canvasWidth) - canvasWidth) * 4; count <= canvasWidth; i += canvasWidth * 4, j -= canvasWidth * 4) 
  { 
    // we have reached the middle of the image, reset i & j to next col
    if (i >= j) {
      count ++;
      i = count * 4;
      j = ((canvasHeight * canvasWidth) - canvasWidth + count) * 4;
    }
    swap_pixels(mirroredImage.data, i, j);
  }

  ctx.putImageData(mirroredImage, 0, 0);
  add_history_event("canvas-edit", selected_canvas);
}

function swap_pixels(data, i, j) {
  let temp = [data[i], data[i+1], data[i+2], data[i+3]];

  // swap the pixels, i becomes j
  data[i] = data[j]           // r
  data[i + 1] = data[j + 1]   // g
  data[i + 2] = data[j + 2]   // b
  data[i + 3] = data[j + 3];  // a
  // j becomes i from temp
  data[j] = temp[0]       // r
  data[j + 1] = temp[1]   // g
  data[j + 2] = temp[2]   // b
  data[j + 3] = temp[3];  // a
}