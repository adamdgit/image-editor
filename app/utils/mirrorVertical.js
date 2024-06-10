export function mirrorVertical(canvasWidth, canvasHeight) {
  const canvas = document.querySelector(".active-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
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
  add_canvas_history("canvas-edit");
}

// swap rgba values using temporary variable
function swap_pixels(data, i, j) {
  let temp = [data[i], data[i+1], data[i+2], data[i+3]];

  data[i] = data[j]           // r
  data[i + 1] = data[j + 1]   // g
  data[i + 2] = data[j + 2]   // b
  data[i + 3] = data[j + 3];  // a

  data[j] = temp[0]       // r
  data[j + 1] = temp[1]   // g
  data[j + 2] = temp[2]   // b
  data[j + 3] = temp[3];  // a
}