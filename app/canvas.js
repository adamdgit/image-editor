// canvas variables
const canvasLayers = document.querySelector('.canvas-layers');
let ctx = undefined
let canvasHeight = 500;
let canvasWidth = 500;

// top toolbar
const fileIn = document.getElementById('imgInp');
const colorPicker = document.getElementById("colorpicker");
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');
const brushSizeButton = document.querySelector('.brushsize');
brushSizeButton.value = 10;

// side toolbar
const gsButton = document.querySelector('.gs-button');
const sepiaButton = document.querySelector('.sepia-button');
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
const hide_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 400c-75.9 0-137.3-58.7-142.9-133.1L72.2 185.8c-13.8 17.3-26.5 35.6-36.7 55.6a32.4 32.4 0 0 0 0 29.2C89.7 376.4 197.1 448 320 448c26.9 0 52.9-4 77.9-10.5L346 397.4a144.1 144.1 0 0 1 -26 2.6zm313.8 58.1l-110.6-85.4a331.3 331.3 0 0 0 81.3-102.1 32.4 32.4 0 0 0 0-29.2C550.3 135.6 442.9 64 320 64a308.2 308.2 0 0 0 -147.3 37.7L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9l588.4 454.7a16 16 0 0 0 22.5-2.8l19.6-25.3a16 16 0 0 0 -2.8-22.5zm-183.7-142l-39.3-30.4A94.8 94.8 0 0 0 416 256a94.8 94.8 0 0 0 -121.3-92.2A47.7 47.7 0 0 1 304 192a46.6 46.6 0 0 1 -1.5 10l-73.6-56.9A142.3 142.3 0 0 1 320 112a143.9 143.9 0 0 1 144 144c0 21.6-5.3 41.8-13.9 60.1z"/></svg>'
const remove_svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="17" width="17" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.7 23.7 0 0 0 -21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0 -16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>'


// paint bucket fill tolerance, 0 means colours must match exactly
// higher the tolerance allows better results for similar colours
const bucket_tolerance = 40; // default 40
// stores canvas image data for each action on a stack for undo/redo
const canvas_history = [];
const undone_history = []; // stores undone history for redo function

//------ INITIALIZE CANVAS ------//
// append inital layer to layers wrapper
add_new_layer(layerWrapper);
// store blank canvas
add_canvas_history();
//------ END INITITALIZE CANVAS ------//


// Handle file upload
fileIn.addEventListener('change', () => {
  const reader = new FileReader()
  const selectedFile = fileIn.files[0]
  const image = new Image();
  if (selectedFile) {
    reader.readAsDataURL(selectedFile)
    reader.onload = selectedFile => image.src = selectedFile.target.result;
    reader.onloadend = () => {
      canvas.height = image.height;
      canvas.width = image.width;
      canvasHeight = image.height;
      canvasWidth = image.width;
      ctx.drawImage(image, 0, 0, image.width, image.height)
      utils.add_canvas_history(canvas_history, ctx, canvasWidth, canvasHeight);
    }
  }
});

// top toolbar
brushSizeButton.addEventListener('change', (e) => tool_size = e.target.value);
colorPicker.addEventListener('change', (e) => set_current_color(e));
undoButton.addEventListener('click', () => undo_history(canvas_history, undone_history));
redoButton.addEventListener('click', () => redo_history(canvas_history, undone_history));

// right toolbar
addLayerButton.addEventListener('click', () => add_new_layer(layerWrapper));

// left toolbar
gsButton.addEventListener('click', () => grayscaleImage(canvasWidth, canvasHeight, canvas_history));
sepiaButton.addEventListener('click', () => sepiaImage(canvasWidth, canvasHeight));

brushButton.addEventListener('click', (e) => updateSelectedTool(e.target));
pencilButton.addEventListener('click', (e) => updateSelectedTool(e.target));
eraserButton.addEventListener('click', (e) => updateSelectedTool(e.target));
bucketButton.addEventListener('click', (e) => updateSelectedTool(e.target));




//----- draw layers on canvas -----//
// function handleLayers() {
//   const temp1 = {
//     topLeft: [0,0],
//     bottomRight: [2,2],
//     data: [231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255]
//   };
//   const temp2 = {
//     topLeft: [1,1],
//     bottomRight: [3,3],
//     data: [100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255]
//   };

//   const layers_stack = [];

//   const combinedData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
//   const data = combinedData.data;

//   // bottom layer first, top layer last, and build the combined array
//   // starting at the top (first layer)
//   layers_stack.push(temp2);
//   layers_stack.push(temp1);

//   while (layers_stack.length > 0) {
//     // top layer
//     let top = layers_stack.pop(); 
//     let startIndex = top.topLeft[0] * top.topLeft[1] * 4;
//     // copy the layer data to the combined layer data
//     for (let j = startIndex; j < data.length; j += 4) {
//         // every 4 is rgba of a pixel, check if the top.data is transparent
//         // only add non transparent rgba values to the combined data.
//         let rgba = [top.data[j], top.data[j +1], top.data[j +2], top.data[j +3]].join("")
//         if (rgba === '0000') continue; // 0000 = transparent

//         data[j] = top.data[j];
//         data[j +1] = top.data[j +1];
//         data[j +2] = top.data[j +2];
//         data[j +3] = top.data[j +3];
//     }
//   }
//   console.log(combinedData.data)
//   ctx.putImageData(combinedData, 0, 0)
// }

// Adds new canvas and layer element with matching id's
function add_new_layer(layerWrapper) {
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
  newLayer.addEventListener('click', (e) => update_selected_layer(e, layerWrapper));
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

  newCanvas.addEventListener('pointerdown', (e) => handlePointerDown(e));
  canvasLayers.prepend(newCanvas);
}

function set_current_color(e) {
  const canvasLayers = document.querySelector('.canvas-layers');
  // convert hex to rgb
  const hex = e.target.value;
  current_color[0] = '0x' + hex[1] + hex[2] | 0
  current_color[1] = '0x' + hex[3] + hex[4] | 0
  current_color[2] = '0x' + hex[5] + hex[6] | 0
  current_color[4] = 255;
  
  // set all canvas context fillstyles to current color
  [...canvasLayers.children].forEach(canvas => {
    canvas.getContext("2d", { willReadFrequently: true }).fillStyle 
    = `rgb(${current_color[0]} ${current_color[1]} ${current_color[2]})`;
  })
}

function updateSelectedTool(target) {
  highlightSelectedTool(target);
  let toolIndex = tools.indexOf(target.dataset.toolname);
  current_tool = tools[toolIndex];
}

// remove any highlited tools and highlight the selected one
function highlightSelectedTool(target) {
  const toolbar_buttons = [...document.querySelector('.toolbar-left').children];
  toolbar_buttons.forEach(button => {
      button.classList.remove('selected-tool')
  })
  target.classList.add('selected-tool');
}


function handlePointerDown(e) {
  [...canvasLayers.children].forEach(canvas => {
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
  });

  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY);

  if (current_tool === "bucket") {
    const { data } = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    if (data.join("") === current_color.join("")) return
    bucket_fill(e.offsetY, e.offsetX, data);
  }
}

function handlePointerMove(e) {
  if (current_tool === "brush") use_brush(e.offsetX, e.offsetY);
  if (current_tool === "pencil") use_pencil(e.offsetX, e.offsetY);
  if (current_tool === "eraser") use_eraser(e.offsetX, e.offsetY);
}

function handlePointerUp() {
  [...canvasLayers.children].forEach(canvas => {
    canvas.removeEventListener('pointermove', handlePointerMove);
  });

  // add undo point after mouseup
  add_canvas_history();
}

// Updates the CTX to the selected canvas
function update_selected_layer(e) {
  // add and remove selected class
  [...layerWrapper.children].forEach(layer => {
    layer.classList.remove('current-layer');
  });
  e.target.classList.add('current-layer');

  // remove pointer events for all children except the selected canvas
  [...canvasLayers.children].forEach(canvas => {
    if (canvas.dataset.layerId === e.target.dataset.layerId) {
      canvas.style.pointerEvents = 'all';
      // switch context whenever we select a new layer to be the default
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    } else {
      canvas.style.pointerEvents = 'none';
    }
  });
}


//----- undo canvas history -----//
// undo history by reverting to previous top of stack canvas state
function undo_history() {
  // do nothing if no history to undo
  if (canvas_history.length === 1) return

  // remove most recent and save for redo
  const removed = canvas_history.pop();
  undone_history.push(removed);

  // restore top of the stack
  const top = canvas_history[canvas_history.length -1];
  ctx.putImageData(top, 0, 0)
}


//----- redo canvas history -----//
// undo history by reverting to previous top of stack canvas state
function redo_history() {
  // do nothing if no history to undo
  if (undone_history.length === 0) return

  // get top of the undone history
  const top = undone_history.pop();
  canvas_history.push(top);

  // restore and redo
  ctx.putImageData(top, 0, 0)
}

//----- add to canvas history -----//
// use this function any time you modify the canvas to create a restore point
function add_canvas_history() {
  // keep stack at 20 items max, remove from bottom if at 20
  if (canvas_history.length > 19) {
    canvas_history.shift();
  }

  if (canvas_history.length === 0) {
    const canvas = document.querySelector('.active-layer');
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    const current = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    canvas_history.push(current);
  }

  // get the current canvas state and save to canvas history stack
  const current = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  canvas_history.push(current);
}


function use_brush(x, y) {
  console.log("using")
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
function bucket_fill(x, y, color) {
  const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  const data = canvasData.data;

  // 1D array to store 0 if not visited, or 1 if a pixel is visited
  const visited = new Uint8ClampedArray(canvasWidth * canvasHeight);

  // colour selected pixel on first run
  data[((x * canvasWidth + y) * 4)] = current_color[0];
  data[((x * canvasWidth + y) * 4) +1] = current_color[1];
  data[((x * canvasWidth + y) * 4) +2] = current_color[2];
  data[((x * canvasWidth + y) * 4) +3] = 255;
  visited[x * canvasWidth + y] = 1;

  const directions = [
    [1, 0], // Down
    [-1, 0], // Up
    [0, 1], // Right
    [0, -1], // Left
  ];

  const stack = [[x, y]];
  while (stack.length > 0) {
    let [x, y] = stack.pop();

    for (const [dx, dy] of directions) {
      let newX = x + dx;
      let newY = y + dy; 
      if (newX > canvasHeight || newY > canvasWidth || newX < 0 || newY < 0) continue;
      if (visited[newX * canvasWidth + newY]) continue;

      // left shift by 2 is the same as * 4 but faster!
      let index = (newX * canvasWidth + newY) << 2;

      if (isValidPixel(index, color, data)) {
        data[index] = current_color[0];    // r
        data[index +1] = current_color[1]; // g
        data[index +2] = current_color[2]; // b
        data[index +3] = 255; // a
        
        stack.push([newX, newY]);
        visited[newX * canvasWidth + newY] = 1;
      }
    }
  }

  ctx.putImageData(canvasData, 0, 0)
}


// return true or false if a pixel is valid to be flood filled
function isValidPixel(index, color, data) {
  let currColor = [data[index], data[index +1], data[index +2]];

  // if the selected pixel is within the canvas and within the tolerance return true
  return (
    currColor[0] >= color[0] -bucket_tolerance && currColor[0] <= color[0] +bucket_tolerance
    && currColor[1] >= color[1] -bucket_tolerance && currColor[1] <= color[1] +bucket_tolerance
    && currColor[2] >= color[2] -bucket_tolerance && currColor[2] <= color[2] +bucket_tolerance
  )
}


//----- gray scale image -----//
// Turns the entire canvas gray-scale
function grayscaleImage() {
  const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const grayscaleImage = ctx.createImageData(canvasWidth, canvasHeight);

  // skip every 4 values (rgba) boomer loops ftw
  for (let i = 0; i < data.data.length; i += 4) 
  { 
    // get average of rgb, set all rbg to the averaged value to create a grayscale image
    let gs = Math.ceil((data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3)
    grayscaleImage.data[i] = gs; // r
    grayscaleImage.data[i + 1] = gs; // g
    grayscaleImage.data[i + 2] = gs; // b
    grayscaleImage.data[i + 3] = 255; // keep alpha as 255
  }

  ctx.putImageData(grayscaleImage, 0, 0);
  add_canvas_history();
}


//----- sepia tone image -----//
// Turns the entire canvas sepia tone
function sepiaImage() {
  const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const sepiaImage = ctx.createImageData(canvasWidth, canvasHeight);

  // skip every 4 values (rgba) boomer loops ftw
  for (let i = 0; i < data.data.length; i += 4) 
  { 
    let red = data.data[i];
    let green = data.data[i + 1];
    let blue = data.data[i + 2];

    // sepia tone formula
    sepiaImage.data[i] = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue); // r
    sepiaImage.data[i + 1] = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue); // g
    sepiaImage.data[i + 2] = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue); // b
    sepiaImage.data[i + 3] = 255; // keep alpha as 255
  }

  ctx.putImageData(sepiaImage, 0, 0);
  add_canvas_history();
}