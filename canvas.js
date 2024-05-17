const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const img = document.querySelector("#img");
const fileIn = document.getElementById('imgInp');
const canvasWrap = document.querySelector('.canvas-wrap');

// toolbar references
const gsButton = document.querySelector('.gs-button')
const brushButton = document.querySelector('.brush-button')
const pencilButton = document.querySelector('.pencil-button')
const eraserButton = document.querySelector('.eraser-button')

// paint bucket fill tolerance, 0 means colours must match exactly
// higher the tolerance allows better results for similar colours
const bucket_tolerance = 40; // default 30
// stores canvas pixel values for each action on a stack for undo/redo
const canvas_history = [];

canvas.width = canvasWrap.clientWidth
canvas.height = canvasWrap.clientHeight

fileIn.addEventListener('change', () => {
  const reader = new FileReader()
  const selectedFile = fileIn.files[0]
  const image = new Image();
  if (selectedFile) {
    reader.readAsDataURL(selectedFile)
    reader.onload = selectedFile => image.src = selectedFile.target.result;
    reader.onloadend = () => ctx.drawImage(image, 0, 0, image.width, image.height)
  }
})

gsButton.addEventListener('click', () => grayscaleImage());

canvas.addEventListener('click', (e) => {
  // gets the rgba colour values as array, for a selected pixel
  const { data } = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
  // joins rgba values into single string eg: [0,0,0,0] = "0000"
  spanFill(e.offsetY, e.offsetX, data, "#2fc0e9");
});

document.addEventListener('keypress', (e) => {
  if (e.ctrlKey && e.key === "\u001a") {
    undo_redo("undo")
  }
});


//----- undo / redo -----//
// uses a stack to store canvas states for each action
// option: "undo" | "redo"
function undo_redo(option) {

  if (option === "undo") {

  }

  if (option === "redo") {

  }

}


//----- paint bucket fill -----//
// fills the selected area with a user selected colour
function spanFill(x, y, color, newColor) {
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const final = ctx.createImageData(canvas.width, canvas.height)
  ctx.fillStyle = newColor;

  const stack = [[x, y]];
  while (stack.length > 0) {
    let [x, y] = stack.pop();

    let lx = x;
    while (isValidSquare(lx, y, color, data)) {
      // save image data, to be filled in later
      data[((lx * canvas.width) * 4) + (y * 4)] = 47;
      data[((lx * canvas.width) * 4) + (y * 4) +1] = 192;
      data[((lx * canvas.width) * 4) + (y * 4) +2] = 233;
      data[((lx * canvas.width) * 4) + (y * 4) +3] = 255;

      lx -= 1;
    }

    let rx = x + 1;
    while (isValidSquare(rx, y, color, data)) {
      data[((rx * canvas.width) * 4) + (y * 4)] = 47;
      data[((rx * canvas.width) * 4) + (y * 4) +1] = 192;
      data[((rx * canvas.width) * 4) + (y * 4) +2] = 233;
      data[((rx * canvas.width) * 4) + (y * 4) +3] = 255;
  
      rx += 1;
    }

    scan(lx, rx-1, y+1, stack, color, data)
    scan(lx, rx-1, y-1, stack, color, data)
  }

  // copy updated data and write to the canvas
  for (let k = 0; k < final.data.length; k++) {
    final.data[k] = data[k]; 
  }
  ctx.putImageData(final, 0, 0)
}

function scan(lx, rx, y, stack, color, data) {
  for (let i = lx; i < rx; i++) {
    if (isValidSquare(i, y, color, data)) {
        stack.push([i, y]);
    }
  }
}

// return true or false if a pixel is valid to be flood filled
function isValidSquare(x, y, color, data2) {
  if (x < 0 || y < 0) return false

  let currColor = [data2[((x * canvas.width) * 4) + (y * 4)],
                  data2[((x * canvas.width) * 4) + (y * 4) +1],
                  data2[((x * canvas.width) * 4) + (y * 4) +2]];

  // if the selected pixel is within the canvas and within the tolerance return true
  if (
    currColor[0] >= color[0] -bucket_tolerance && currColor[0] <= color[0] +bucket_tolerance
    && currColor[1] >= color[1] -bucket_tolerance && currColor[1] <= color[1] +bucket_tolerance
    && currColor[2] >= color[2] -bucket_tolerance && currColor[2] <= color[2] +bucket_tolerance
    && x >= 0 && x < canvas.height && y >= 0 && y < canvas.width
  ) return true
  else return false
}


//----- gray scale image -----//
// Turns the entire canvas gray-scale
function grayscaleImage() {
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // to create a grayscale version of the image we must get each pixel rgb value
  // Get the average of the RBG values eg: 255, 152, 170 / 3 =  192 (rounded up)

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
}
