import { tools } from "../canvas.js";

// Highlights the selected tool in tools panel
export function updateSelectedTool(target) {
  highlightSelectedTool(target);
  let toolIndex = tools.indexOf(target.dataset.toolname);
  return tools[toolIndex];
}

// remove any highlited tools and highlight the selected one
function highlightSelectedTool(target) {
  const toolbar_buttons = [...document.querySelector('.toolbar-left').children];
  toolbar_buttons.forEach(button => {
      button.classList.remove('selected-tool')
  })
  target.classList.add('selected-tool');
}
