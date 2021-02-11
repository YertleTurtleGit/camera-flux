"use strict";
const IMAGE_BUFFER_LENGTH = 2;
const IMAGE_CAPTURE_DELTA = 50;
const FADE_FACTOR = 0.75;
const FLOAT_PRECISION = "mediump" /* MEDIUM */;
/*
Webcam mode is set to true automatically on demand.
*/
const CAMERA_RESOLUTION = {
    width: 800,
    height: 600,
};
const WIDTH = CAMERA_RESOLUTION.width;
const HEIGHT = CAMERA_RESOLUTION.height;
let uiBaseLayer = 0;
function uiLog(message, layer = uiBaseLayer) {
    /*let logMessage: string = message;
    for (let i = 0; i < layer; i++) {
       logMessage = "- " + logMessage;
    }
    console.log(logMessage);*/
    //LOG_ELEMENT.innerHTML = message;
}
