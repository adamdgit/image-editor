import { ctx } from "../canvas.js";

//----- undo canvas history -----//
// undo history by reverting to previous top of stack canvas state
export function undo_history(canvas_history, undone_history) {
  // do nothing if no history to undo
  if (canvas_history.length === 1) return

  // remove most recent and save for redo
  const removed = canvas_history.pop();
  undone_history.push(removed);

  // restore top of the stack
  const top = canvas_history[canvas_history.length -1];
  ctx.putImageData(top, 0, 0)
}
