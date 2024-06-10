import { updateSelectedTool } from "./utils/updateSelectedTool.js"
import { addNewLayer } from "./utils/addNewLayer.js";
import { userImageUpload } from "./utils/userUploadImage.js";
import { setCurrentColor } from "./utils/setColor.js";
import { filterSepia } from "./utils/sepiaImage.js";
import { filterGrayscale } from "./utils/grayscaleImage.js";
import { mirrorHorizontal } from "./utils/mirrorHorizontal.js";
import { mirrorVertical } from "./utils/mirrorVertical.js";

// canvas variables
const canvasLayers = document.querySelector('.canvas-layers');
let canvasHeight = 400;
let canvasWidth = 500;
canvasLayers.style.width = `${canvasWidth}px`;
canvasLayers.style.height = `${canvasHeight}px`;

// top toolbar
const fileIn = document.getElementById('imgInp');
const colorPicker = document.getElementById("colorpicker");
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');
const brushSizeButton = document.querySelector('.brushsize');
brushSizeButton.value = 10;

// side toolbar
const toolbarLeft = document.querySelector('.toolbar-left');
const gsButton = document.querySelector('.gs-button');
const sepiaButton = document.querySelector('.sepia-button');
const mirrorHButtonH = document.querySelector('.mirrorh-button');
const mirrorHButtonV = document.querySelector('.mirrorv-button');
const bucketButton = document.querySelector('.bucket-button');
const brushButton = document.querySelector('.brush-button');
const pencilButton = document.querySelector('.pencil-button');
const eraserButton = document.querySelector('.eraser-button');
const addLayerButton = document.querySelector('.add-layer-btn');
const layerWrapper = document.querySelector('.layers-wrap');

// options
export const tools = ["brush", "pencil", "eraser", "bucket"];
let current_tool = tools[0];
export let current_color = [0, 0, 0, 255];
export let tool_size = 10;
// 0 = RGB values must match completely, higher means RGB values can vary to get better fill results
export let fill_tolerance = 0;

// stores canvas image data for each action on a stack for undo/redo
const canvas_history = [];
const undone_history = []; // stores undone history for redo function

//------ INITIALIZE CANVAS ------//
// append inital layer to layers wrapper
addNewLayer(layerWrapper);
// store blank canvas
// addCanvasHistory("canvas-edit");
//------ END INITITALIZE CANVAS ------//

// top toolbar
fileIn.addEventListener('change', () => userImageUpload());
brushSizeButton.addEventListener('change', (e) => tool_size = e.target.value);
colorPicker.addEventListener('change', (e) => setCurrentColor(e));
undoButton.addEventListener('click', () => undo_history());
redoButton.addEventListener('click', () => redo_history());

// right toolbar
addLayerButton.addEventListener('click', () => addNewLayer(layerWrapper));

// left toolbar
gsButton.addEventListener('click', () => filterGrayscale(canvasWidth, canvasHeight));
sepiaButton.addEventListener('click', () => filterSepia(canvasWidth, canvasHeight));
mirrorHButtonH.addEventListener('click', () => mirrorHorizontal(canvasWidth, canvasHeight));
mirrorHButtonV.addEventListener('click', () => mirrorVertical(canvasWidth, canvasHeight));

brushButton.addEventListener('click', (e) => updateSelectedTool(e.target));
pencilButton.addEventListener('click', (e) => updateSelectedTool(e.target));
eraserButton.addEventListener('click', (e) => updateSelectedTool(e.target));
bucketButton.addEventListener('click', (e) => updateSelectedTool(e.target));