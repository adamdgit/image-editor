export function filterSepia(canvasWidth, canvasHeight) {
  const canvas = document.querySelector(".active-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  const sepiaImage = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  // skip every 4 values (rgba) boomer loops ftw
  for (let i = 0; i < data.length; i += 4) 
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
  add_canvas_history("canvas-edit");
}