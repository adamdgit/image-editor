//----- draw layers on canvas -----//
// function handleLayers() {
//   const temp1 = {
//     topLeft: [0,0],
//     bottomRight: [2,2],
//     data: [231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255, 231,20,38,255]
//   };
//   const temp2 = {
//     topLeft: [1,1],
//     bottomRight: [3,3],
//     data: [100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255, 100,100,100,255]
//   };

//   const layers_stack = [];

//   const combinedData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
//   const data = combinedData.data;

//   // bottom layer first, top layer last, and build the combined array
//   // starting at the top (first layer)
//   layers_stack.push(temp2);
//   layers_stack.push(temp1);

//   while (layers_stack.length > 0) {
//     // top layer
//     let top = layers_stack.pop(); 
//     let startIndex = top.topLeft[0] * top.topLeft[1] * 4;
//     // copy the layer data to the combined layer data
//     for (let j = startIndex; j < data.length; j += 4) {
//         // every 4 is rgba of a pixel, check if the top.data is transparent
//         // only add non transparent rgba values to the combined data.
//         let rgba = [top.data[j], top.data[j +1], top.data[j +2], top.data[j +3]].join("")
//         if (rgba === '0000') continue; // 0000 = transparent

//         data[j] = top.data[j];
//         data[j +1] = top.data[j +1];
//         data[j +2] = top.data[j +2];
//         data[j +3] = top.data[j +3];
//     }
//   }
//   console.log(combinedData.data)
//   ctx.putImageData(combinedData, 0, 0)
// }