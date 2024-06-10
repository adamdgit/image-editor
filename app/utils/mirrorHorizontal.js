export function mirrorHorizontal(canvasWidth, canvasHeight) {
  const canvas = document.querySelector(".active-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
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
  add_canvas_history("canvas-edit");
}