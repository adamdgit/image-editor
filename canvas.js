// canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const img = document.querySelector("#img");
const fileIn = document.getElementById('imgInp');
canvas.width = canvas.parentNode.offsetWidth - 140
canvas.height = 700;

// top toolbar 
const undoButton = document.querySelector('.undo-button')
const redoButton = document.querySelector('.redo-button')

// side toolbar
const gsButton = document.querySelector('.gs-button')
const sepiaButton = document.querySelector('.sepia-button')
const bucketButton = document.querySelector('.bucket-button')
const brushButton = document.querySelector('.brush-button')
const pencilButton = document.querySelector('.pencil-button')
const eraserButton = document.querySelector('.eraser-button')

// currently selected tool and tool options
const tools = ["brush", "pencil", "eraser", "bucket"];
let current_tool = tools[0];

// paint bucket fill tolerance, 0 means colours must match exactly
// higher the tolerance allows better results for similar colours
const bucket_tolerance = 40; // default 40
// stores canvas image data for each action on a stack for undo/redo
const canvas_history = [];
const undone_history = []; // stores undone history for redo function

// store blank canvas
add_canvas_history();

fileIn.addEventListener('change', () => {
  const reader = new FileReader()
  const selectedFile = fileIn.files[0]
  const image = new Image();
  if (selectedFile) {
    reader.readAsDataURL(selectedFile)
    reader.onload = selectedFile => image.src = selectedFile.target.result;
    reader.onloadend = () => {
      ctx.drawImage(image, 0, 0, image.width, image.height)
      add_canvas_history();
    }
  }
});

gsButton.addEventListener('click', () => grayscaleImage());
sepiaButton.addEventListener('click', () => sepiaImage());
undoButton.addEventListener('click', () => undo_history());
redoButton.addEventListener('click', () => redo_history());

brushButton.addEventListener('click', (e) => {
  let toolIndex = tools.indexOf(e.target.dataset.toolname);
  current_tool = tools[toolIndex];
  canvas.addEventListener('pointerdown', handlePointerDown);
});

pencilButton.addEventListener('click', (e) => {
  let toolIndex = tools.indexOf(e.target.dataset.toolname);
  current_tool = tools[toolIndex];
  canvas.addEventListener('pointerdown', handlePointerDown);
});

bucketButton.addEventListener('click', (e) => {
  let toolIndex = tools.indexOf(e.target.dataset.toolname);
  current_tool = tools[toolIndex];
  canvas.addEventListener('pointerdown', handlePointerDown);
});


function handlePointerDown(e) {
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);

  if (current_tool === "brush") {
    use_brush(e.offsetX, e.offsetY, 20, "#2fc0e9");
  }

  if (current_tool === "pencil") {
    use_pencil(e.offsetX, e.offsetY, 20, "#2fc0e9");
  }

  if (current_tool === "bucket") {
    const { data } = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    if (data.join("") === "47192233255") return
    bucket_fill(e.offsetY, e.offsetX, data, "#2fc0e9");
  }
}

function handlePointerMove(e) {
  if (current_tool === "brush") {
    use_brush(e.offsetX, e.offsetY, 20, "#2fc0e9");
  }

  if (current_tool === "pencil") {
    use_pencil(e.offsetX, e.offsetY, 20, "#2fc0e9");
  }
}

function handlePointerUp() {
  canvas.removeEventListener('pointermove', handlePointerMove);
  // add undo point after mouseup
  add_canvas_history();
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
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  canvas_history.push(current)
}


function use_brush(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function use_pencil(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}


//----- paint bucket fill -----//
// fills the selected area with a user selected colour
function bucket_fill(x, y, color, newColor) {
  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = canvasData.data;
  ctx.fillStyle = newColor;

  const visited = Array.from({ length: canvas.width }, () => Array(canvas.height).fill(0));

  // colour selected pixel on first run
  data[((x * canvas.width + y) * 4)] = 47;
  data[((x * canvas.width + y) * 4) +1] = 192;
  data[((x * canvas.width + y) * 4) +2] = 233;
  data[((x * canvas.width + y) * 4) +3] = 255;
  visited[x][y] = 1;

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
      if (x + dx > canvas.height || y + dy > canvas.width 
          || x + dx < 0 || y + dy < 0) continue;
      if (visited[x + dx][y + dy]) continue;

      // left shift by 2 is the same as * 4 but faster!
      const index = ((x + dx) * canvas.width + (y + dy) << 2);

      if (isValidSquare(x + dx, y + dy, color, data)) {
        data[index] = 47;
        data[index +1] = 192;
        data[index +2] = 233;
        data[index +3] = 255;
        
        stack.push([x + dx, y + dy]);
        visited[x + dx][y + dy] = 1;
      }
    }

  }

  ctx.putImageData(canvasData, 0, 0)
  add_canvas_history();
}


// return true or false if a pixel is valid to be flood filled
function isValidSquare(x, y, color, data) {
  let currColor = [data[((x * canvas.width + y) * 4)],
                  data[((x * canvas.width + y) * 4) +1],
                  data[((x * canvas.width + y) * 4) +2]];

  // if the selected pixel is within the canvas and within the tolerance return true
  return (
    currColor[0] >= color[0] -bucket_tolerance && currColor[0] <= color[0] +bucket_tolerance
    && currColor[1] >= color[1] -bucket_tolerance && currColor[1] <= color[1] +bucket_tolerance
    && currColor[2] >= color[2] -bucket_tolerance && currColor[2] <= color[2] +bucket_tolerance
    && x < canvas.height && y < canvas.width
  )
}


//----- gray scale image -----//
// Turns the entire canvas gray-scale
function grayscaleImage() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const grayscaleImage = ctx.createImageData(canvas.width, canvas.height);

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
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sepiaImage = ctx.createImageData(canvas.width, canvas.height);

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
