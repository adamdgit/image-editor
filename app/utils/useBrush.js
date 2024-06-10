import { tool_size } from "../canvas2";

export function use_brush(x, y, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, tool_size, 0, 2 * Math.PI);
  ctx.fill();
}