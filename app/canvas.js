// canvas variables
const currentLayer = document.querySelector('.current-layer');
const canvasLayers = document.querySelector('.canvas-layers');
let selected_canvas = document.querySelector('canvas');
let ctx = selected_canvas.getContext("2d", { willReadFrequently: true });
let canvasHeight = 400;
let canvasWidth = 500;
selected_canvas.width = canvasWidth;
selected_canvas.height = canvasHeight;
canvasLayers.style.width = `${canvasWidth}px`;
canvasLayers.style.height = `${canvasHeight}px`;

// top toolbar
const fileIn = document.getElementById('imgInp');
const colorPicker = document.getElementById("colorpicker");
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');
const brushSizeButton = document.querySelector('.brushsize');

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

// options
const tools = ["brush", "pencil", "eraser", "bucket"];
let current_tool = tools[0];
let current_color = [0, 0, 0, 255];
let tool_size = 10;
const hide_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 400c-75.9 0-137.3-58.7-142.9-133.1L72.2 185.8c-13.8 17.3-26.5 35.6-36.7 55.6a32.4 32.4 0 0 0 0 29.2C89.7 376.4 197.1 448 320 448c26.9 0 52.9-4 77.9-10.5L346 397.4a144.1 144.1 0 0 1 -26 2.6zm313.8 58.1l-110.6-85.4a331.3 331.3 0 0 0 81.3-102.1 32.4 32.4 0 0 0 0-29.2C550.3 135.6 442.9 64 320 64a308.2 308.2 0 0 0 -147.3 37.7L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9l588.4 454.7a16 16 0 0 0 22.5-2.8l19.6-25.3a16 16 0 0 0 -2.8-22.5zm-183.7-142l-39.3-30.4A94.8 94.8 0 0 0 416 256a94.8 94.8 0 0 0 -121.3-92.2A47.7 47.7 0 0 1 304 192a46.6 46.6 0 0 1 -1.5 10l-73.6-56.9A142.3 142.3 0 0 1 320 112a143.9 143.9 0 0 1 144 144c0 21.6-5.3 41.8-13.9 60.1z"/></svg>';
const remove_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.7 23.7 0 0 0 -21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0 -16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>';
// 0 = RGB values must match completely, higher means RGB values can vary to get better fill results
const fill_tolerance = 20;

// stores canvas image data for each action on a stack for undo/redo
const history = [];
const undone_history = []; // stores undone history for redo function
// blank canvas and layer info is stored as default into history, 
// any futures changes can be reverted to default
const DEFAULT_HISTORY_ITEMS = 2;

//------ INITIALIZE DEFAULTS ------//
selected_canvas.addEventListener('pointerdown', handlePointerDown);
currentLayer.children[0].addEventListener('click', (e) => hide_layer(e));
currentLayer.children[1].addEventListener('click', (e) => update_selected_layer(e));
currentLayer.children[2].addEventListener('click', () => {
  // only add to history if there is a layer to remove, never remove inital canvas layer
  if (remove_layer(currentLayer.dataset.layerId)) {
    add_history_event("delete-layer", selected_canvas);
  }
});
add_history_event("canvas-edit", selected_canvas);
add_history_event("add-new-layer", currentLayer);
//---------------------------------//

// top toolbar
fileIn.addEventListener('change', () => user_image_upload());
brushSizeButton.addEventListener('change', (e) => tool_size = e.target.value);
colorPicker.addEventListener('change', (e) => set_current_color(e));
undoButton.addEventListener('click', () => undo_history());
redoButton.addEventListener('click', () => redo_history());

// right toolbar
addLayerButton.addEventListener('click', (e) => {
  let newLayer = add_new_layer();
  add_history_event("add-new-layer", newLayer);
});

// left toolbar
gsButton.addEventListener('click', () => filter_grayscale());
sepiaButton.addEventListener('click', () => filter_sepia());
mirrorHButtonH.addEventListener('click', () => mirror_image_horizontal());
mirrorHButtonV.addEventListener('click', () => mirror_image_vertical());

brushButton.addEventListener('click', (e) => update_selected_tool(e.target));
pencilButton.addEventListener('click', (e) => update_selected_tool(e.target));
eraserButton.addEventListener('click', (e) => update_selected_tool(e.target));
bucketButton.addEventListener('click', (e) => update_selected_tool(e.target));


// Adds new canvas and layer element with matching id's
function add_new_layer(canvasData, id) {
  // when restoring old layers using undo, we pass the id to restore its original data
  // otherwise just use current timestamp as a unique ID
  let layerId = Date.now();
  if (id) layerId = id; 

  const newLayer = document.createElement('div');

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
  hideBtn.innerHTML = hide_svg;
  hideBtn.addEventListener('click', (e) => hide_layer(e));

  const spanEl = document.createElement('span');
  spanEl.classList.add('layer-text');
  spanEl.innerHTML = `Layer`;
  spanEl.addEventListener('click', (e) => update_selected_layer(e));

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-layer-btn');
  deleteBtn.innerHTML = remove_svg;
  deleteBtn.addEventListener('click', () => {
    if (!remove_layer(layerId)) return;
    add_history_event("delete-layer", newCanvas);
  });

  newLayer.appendChild(hideBtn);
  newLayer.appendChild(spanEl);
  newLayer.appendChild(deleteBtn);
  layerWrapper.appendChild(newLayer);

  // when restoring a deleted layer via undo actions, we pass the 
  // data from the deleted canvas, so it can be restored
  if (canvasData) newCanvas.getContext("2d").putImageData(canvasData, 0, 0);

  canvasLayers.prepend(newCanvas);
  return newLayer;
}

// handles removing a layer by given ID, returns true if successful
function remove_layer(layerId) {
  // Must have atleast one canvas
  if (canvasLayers.children.length === 1) return false;

  // remove associated canvas by id match
  [...canvasLayers.children].forEach(canvas => {
    if (canvas.dataset.layerId === layerId.toString()) {
      canvas.remove();
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
}

// remove any highlited tools and highlight the selected one
function highlight_selected_tool(target) {
  [...toolbarLeft.children].forEach(button => {
      button.classList.remove('selected-tool')
  })
  target.classList.add('selected-tool');
}


// Updates the CTX to the selected canvas
function update_selected_layer(e) {
  // add and remove selected class
  [...layerWrapper.children].forEach(layer => {
    layer.classList.remove('current-layer');
  });
  e.target.classList.add('current-layer');

  selected_canvas.removeEventListener('pointerdown', handlePointerDown);

  // remove pointer events for all children except the selected canvas
  [...canvasLayers.children].forEach(canvas => {
    if (canvas.dataset.layerId === e.target.dataset.layerId) {
      canvas.style.pointerEvents = 'all';
      canvas.classList.add("active-canvas");
      // switch context whenever we select a new layer to be the default
      ctx = canvas.getContext("2d", { willReadFrequently: true });
      selected_canvas = canvas;
      selected_canvas.addEventListener('pointerdown', handlePointerDown);
    } else {
      // remove pointer events and event listeners for non selected layers
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.style.pointerEvents = 'none';
      canvas.classList.remove("active-canvas");
    }
  });
}

//----- undo history -----//
// undo history by reverting to previous top of stack state
function undo_history() {
  // do nothing if no history to undo
  if (history.length === DEFAULT_HISTORY_ITEMS) return

  // remove most recent and save for redo
  const removedItem = history.pop();
  undone_history.push(removedItem);

  if (removedItem.type === "canvas-edit") {
    for (let i = history.length -1; i >= 0; i--) {
      const element = history[i];
      if (element.type === removedItem.type) {
        ctx.putImageData(element.data, 0, 0);
        break;
      }
    }
  }

  if (removedItem.type === "add-new-layer") {
    remove_layer(removedItem.id);
  }

  if (removedItem.type === "delete-layer") {
    add_new_layer(removedItem.data, removedItem.id);
  }
  console.log("remove: ", history)
}

//----- redo history -----//
// undo history by reverting to previous top of stack state
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
    ctx.putImageData(removedItem.data, 0, 0);
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
      element: element,
      id: element.dataset.layerId
    });
  }

  if (type === "add-new-layer") {
    history.push({
      type: type,
      data: null,
      element: element,
      id: element.dataset.layerId
    });
  }

  if (type === "delete-layer") {
      // get canvas associated with deleted layer
      const deletedctx = element.getContext("2d");
      const deleted = deletedctx.getImageData(0, 0, canvasWidth, canvasHeight);
      remove_layer(element.dataset.layerId)
      history.push({
        type: type,
        data: deleted,
        element: element,
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