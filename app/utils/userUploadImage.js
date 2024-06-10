import { addCanvasHistory } from "./addCanvasHistory.js";

export function userImageUpload() {
  const canvas = document.querySelector(".active-canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })

  const reader = new FileReader();
  const selectedFile = fileIn.files[0];
  const image = new Image();

  if (selectedFile) {
    reader.readAsDataURL(selectedFile)
    reader.onload = selectedFile => image.src = selectedFile.target.result;
    reader.onloadend = () => {
      // un-comment if you want to resize canvas to the uploaded image size
      // selected_canvas.height = image.height;
      // selected_canvas.width = image.width;
      ctx.drawImage(image, 0, 0, image.width, image.height)
      addCanvasHistory("canvas-edit");
    }
  }
}