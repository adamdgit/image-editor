// canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const img = document.querySelector("#img");
const fileIn = document.getElementById('imgInp');

canvas.width = 500; // size of left and right toolbars
canvas.height = 500;
let canvasHeight = canvas.height;
let canvasWidth = canvas.width;

// top toolbar
const colorPicker = document.getElementById("colorpicker");
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');
const brushSizeButton = document.querySelector('.brushsize');

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
const layers = [];
const tools = ["brush", "pencil", "eraser", "bucket"];
let current_tool = tools[0];
let current_color = [0, 0, 0, 255];
let tool_size = 10;

// paint bucket fill tolerance, 0 means colours must match exactly
// higher the tolerance allows better results for similar colours
const bucket_tolerance = 40; // default 40
// stores canvas image data for each action on a stack for undo/redo
const canvas_history = [];
const undone_history = []; // stores undone history for redo function

// INITIALIZE CANVAS
// store blank canvas
add_canvas_history();
// store blank canvas data into the starting layer
layers.push(ctx.getImageData(0, 0, canvasWidth, canvasHeight));

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
      add_canvas_history();
    }
  }
});

gsButton.addEventListener('click', () => grayscaleImage());
sepiaButton.addEventListener('click', () => sepiaImage());
undoButton.addEventListener('click', () => undo_history());
redoButton.addEventListener('click', () => redo_history());

addLayerButton.addEventListener('click', (e) => {
  console.log(e.target);
  const newLayer = document.createElement('div');
  newLayer.classList.add("layer")
  layerWrapper.appendChild(newLayer);
});

brushSizeButton.addEventListener('change', (e) => {
  console.log(e.target.value);
});

colorPicker.addEventListener('change', (e) => {
  const hex = e.target.value;
  // convert hex to rgb
  current_color = ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0, 255];
  ctx.fillStyle = `rgb(${current_color[0]} ${current_color[1]} ${current_color[2]})`;
});

// adds event listener for canvas events
canvas.addEventListener('pointerdown', handlePointerDown);

brushButton.addEventListener('click', (e) => updateSelectedTool(e.target));
pencilButton.addEventListener('click', (e) => updateSelectedTool(e.target));
bucketButton.addEventListener('click', (e) => updateSelectedTool(e.target));

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
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);

  if (current_tool === "brush") {
    use_brush(e.offsetX, e.offsetY, 20);
  }

  if (current_tool === "pencil") {
    use_pencil(e.offsetX, e.offsetY);
  }

  if (current_tool === "bucket") {
    const { data } = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    if (data.join("") === current_color.join("")) return
    bucket_fill(e.offsetY, e.offsetX, data);
  }
}

function handlePointerMove(e) {
  if (current_tool === "brush") {
    use_brush(e.offsetX, e.offsetY, 20);
  }

  if (current_tool === "pencil") {
    use_pencil(e.offsetX, e.offsetY);
  }
}

function handlePointerUp() {
  canvas.removeEventListener('pointermove', handlePointerMove);
  // add undo point after mouseup
  add_canvas_history();
}

//----- draw layers on canvas -----//
function handleLayers() {
  const temp1 = {
    topLeft: [0,0],
    bottomRight: [2,2],
    data: [231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255]
  };
  const temp2 = {
    topLeft: [1,1],
    bottomRight: [3,3],
    data: [100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255]
  };

  const layers_stack = [];

  const combinedData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = combinedData.data;

  // bottom layer first, top layer last, and build the combined array
  // starting at the top (first layer)
  layers_stack.push(temp2);
  layers_stack.push(temp1);

  while (layers_stack.length > 0) {
    // top layer
    let top = layers_stack.pop(); 
    let startIndex = top.topLeft[0] * top.topLeft[1] * 4;
    // copy the layer data to the combined layer data
    for (let j = startIndex; j < data.length; j += 4) {
        // every 4 is rgba of a pixel, check if the top.data is transparent
        // only add non transparent rgba values to the combined data.
        let rgba = [top.data[j], top.data[j +1], top.data[j +2], top.data[j +3]].join("")
        if (rgba === '0000') continue; // 0000 = transparent

        data[j] = top.data[j];
        data[j +1] = top.data[j +1];
        data[j +2] = top.data[j +2];
        data[j +3] = top.data[j +3];
    }
  }
  console.log(combinedData.data)
  ctx.putImageData(combinedData, 0, 0)
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

  // get the current canvas state and save to canvas history stack
  const current = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  canvas_history.push(current);
}


function use_brush(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function use_pencil(x, y) {
  ctx.fillRect(x, y, 1, 1);
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
