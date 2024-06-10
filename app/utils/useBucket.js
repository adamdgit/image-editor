import { canvasWidth, canvasHeight, current_color } from "../canvas.js";
import { fill_tolerance } from "../canvas.js";

//----- paint bucket fill -----//
// fills the selected area with a user selected colour
export function use_bucket(y, x, ctx) {
  const { data: selectedColor } = ctx.getImageData(x, y, 1, 1);
  // if selected pixel is the same as the current color, early return
  if (selectedColor.join("") === current_color.join("")) return;

  const canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  const data = canvasData.data;

  // sometimes selected pixel x or y can be .5 ??
  x = Math.round(x);
  y = Math.round(y);

  const stack = [[x,y]];
  let index = (y * canvasWidth + x) * 4;

  while (stack.length > 0) {
    let [x , y] = stack.pop();
    index = (y * canvasWidth + x) * 4;

    while (y-- >= 0 && color_is_valid(selectedColor, data[index], data[index +1], data[index +2], data[index +3])) {
      index -= canvasWidth * 4;
    }
    index += canvasWidth * 4;
    y++;

    let hitLeft, hitRight = false;

    // start going down and colour valid pixels
    while(y++ < canvasHeight -1 && color_is_valid(selectedColor, data[index], data[index +1], data[index +2], data[index +3])) {
      // update pixel colours
      data[index] = current_color[0];    // r
      data[index +1] = current_color[1]; // g
      data[index +2] = current_color[2]; // b
      data[index +3] = 255;              // a

      if (x > 0) {
        // check left pixel is valid
        if (color_is_valid(selectedColor, data[index -4], data[index -4 +1], data[index -4 +2], data[index -4 +3])) {
          if (!hitLeft) {
            stack.push([x -1, y]);
            hitLeft = true;
          }
        } else if (hitLeft) {
          hitLeft = false;
        }
      }

      if (x < canvasWidth -1) {
        // check right pixel is valid
        if (color_is_valid(selectedColor, data[index +4], data[index +4 +1], data[index +4 +2], data[index +4 +3])) {
          if (!hitRight) {
            stack.push([x +1, y]);
            hitRight = true;
          }
        } else if (hitRight) {
          hitRight = false;
        }
      }
      index += canvasWidth * 4;
    }
  }

  ctx.putImageData(canvasData, 0, 0)
}

// return true or false if a pixel is valid to be flood filled
function color_is_valid(color, r, g, b, a) {
  return (
    r >= color[0] -fill_tolerance && r <= color[0] +fill_tolerance
    && g >= color[1] -fill_tolerance && g <= color[1] +fill_tolerance
    && b >= color[2] -fill_tolerance && b <= color[2] +fill_tolerance
    && a === color[3] // alpha should be equal
  )
}