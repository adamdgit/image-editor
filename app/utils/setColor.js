import { current_color } from "../canvas2.js";
// 
export function setCurrentColor(e) {
  const canvasLayers = document.querySelector('.canvas-layers');
  // convert hex to rgb
  const hex = e.target.value;
  current_color[0] = '0x' + hex[1] + hex[2] | 0
  current_color[1] = '0x' + hex[3] + hex[4] | 0
  current_color[2] = '0x' + hex[5] + hex[6] | 0
  current_color[4] = 255;
  
  // set all canvas context fillstyles to current color
  [...canvasLayers.children].forEach(canvas => {
    canvas.getContext("2d", { willReadFrequently: true }).fillStyle 
    = `rgb(${current_color[0]} ${current_color[1]} ${current_color[2]})`;
  })
}