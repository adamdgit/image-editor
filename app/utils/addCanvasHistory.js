import { canvasHeight, canvasWidth, canvas_history } from "../canvas.js";

//----- add to canvas history -----//
// use this function any time you modify the canvas to create a restore point
export function addCanvasHistory(ctx) {
  // keep stack at 20 items max, remove from bottom if at 20
  if (canvas_history.length > 19) {
    canvas_history.shift();
  }

  if (canvas_history.length === 0) {
    const canvas = document.querySelector('.active-layer');
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    const current = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    canvas_history.push(current);
  } else {
    const current = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    canvas_history.push(current);
  }
};