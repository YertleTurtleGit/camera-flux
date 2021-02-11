"use strict";

const IMAGE_BUFFER_LENGTH = 2;
const IMAGE_CAPTURE_DELTA = 50;
const FADE_FACTOR = 0.75;

/*
The float precision used on the gpu. Set to medium when facing errors.
*/
const enum GPU_GL_FLOAT_PRECISION {
   MEDIUM = "medium" + "p",
   HIGH = "high" + "p",
}
const FLOAT_PRECISION = GPU_GL_FLOAT_PRECISION.MEDIUM;

/*
Webcam mode is set to true automatically on demand.
*/
const CAMERA_RESOLUTION: { width: number; height: number } = {
   width: 800,
   height: 600,
};
const WIDTH: number = CAMERA_RESOLUTION.width;
const HEIGHT: number = CAMERA_RESOLUTION.height;

let uiBaseLayer: number = 0;
function uiLog(message: string, layer: number = uiBaseLayer) {
   /*let logMessage: string = message;
   for (let i = 0; i < layer; i++) {
      logMessage = "- " + logMessage;
   }
   console.log(logMessage);*/
   //LOG_ELEMENT.innerHTML = message;
}
