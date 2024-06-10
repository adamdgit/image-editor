export function filterGrayscale(canvasWidth, canvasHeight) {
  const canvas = document.querySelector(".active-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
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
  add_canvas_history("canvas-edit");
}