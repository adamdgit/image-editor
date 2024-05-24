import { canvasWidth, canvasHeight, current_color } from "../canvas.js";
import { bucket_tolerance } from "../canvas.js";
import { ctx } from "../canvas.js";

//----- paint bucket fill -----//
// fills the selected area with a user selected colour
export function bucket_fill(x, y, color) {
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