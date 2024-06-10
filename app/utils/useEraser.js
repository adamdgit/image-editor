import { tool_size } from "../canvas2";

export function use_eraser(x, y, ctx) {
  ctx.clearRect(x - (tool_size / 2), y - (tool_size / 2), tool_size, tool_size);
}