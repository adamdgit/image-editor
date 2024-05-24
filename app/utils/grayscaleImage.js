import { add_canvas_history } from "./addCanvasHistory.js";
import { ctx } from "../canvas.js";

//----- gray scale image -----//
// Turns the entire canvas gray-scale
export function grayscaleImage(canvasWidth, canvasHeight, canvas_history) {
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
  add_canvas_history(canvas_history, ctx, canvasWidth, canvasHeight);
}