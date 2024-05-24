import { ctx } from "../canvas.js";

//----- redo canvas history -----//
// undo history by reverting to previous top of stack canvas state
export function redo_history(canvas_history, undone_history) {
  // do nothing if no history to undo
  if (undone_history.length === 0) return

  // get top of the undone history
  const top = undone_history.pop();
  canvas_history.push(top);

  // restore and redo
  ctx.putImageData(top, 0, 0)
}