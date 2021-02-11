"use strict";
const webcam = new Webcam([WIDTH, HEIGHT], webCamIsReady);
webcam.startStreaming();
function webCamIsReady() {
    captureImages();
}
const capturedImages = Array(IMAGE_BUFFER_LENGTH);
function captureImages() {
    for (let i = 0; i < capturedImages.length; i++) {
        capturedImages[i] = new Image();
        capturedImages[i].addEventListener("load", imageCaptured);
        setTimeout(captureImage.bind(null, i), IMAGE_CAPTURE_DELTA * i);
    }
}
function captureImage(imageIndex) {
    capturedImages[imageIndex].src = webcam.takePicture();
}
let capturedImagesCount = 0;
function imageCaptured() {
    capturedImagesCount++;
    if (capturedImagesCount === IMAGE_BUFFER_LENGTH) {
        capturedImagesCount = 0;
        renderDifferenceImage(capturedImages, lastDifferenceImage);
    }
}
const GLSL_FADE_FACTOR = new GlslFloat(FADE_FACTOR);
let lastDifferenceImage = new Image(WIDTH, HEIGHT);
function renderDifferenceImage(images, fadeFrom) {
    const differenceShader = new Shader();
    differenceShader.bind();
    const firstLuminance = GlslImage.load(images[0]).getLuminanceFloat();
    const jsMin = 0.05;
    const min = new GlslFloat(jsMin);
    const factor = new GlslFloat(1 / jsMin);
    const clampedLuminanceData = new Array(images.length - 1);
    for (let i = 1; i < images.length; i++) {
        const fractionFactor = new GlslFloat(1 / ((images.length - i) * 10));
        const luminance = GlslImage.load(images[i]).getLuminanceFloat();
        const luminanceDelta = firstLuminance
            .subtractFloat(luminance)
            .absolute();
        const luminanceDeltaClamped = luminanceDelta
            .maximum(min)
            .subtractFloat(min)
            .multiplyFloat(factor);
        clampedLuminanceData[i - 1] = luminanceDeltaClamped.multiplyFloat(fractionFactor);
    }
    const fadedLuminance = GlslImage.load(fadeFrom)
        .getLuminanceFloat()
        .multiplyFloat(GLSL_FADE_FACTOR);
    const resultVector = new GlslVector4([
        new GlslFloat(0)
            .addFloat(...clampedLuminanceData)
            .addFloat(fadedLuminance),
        new GlslFloat(0)
            .addFloat(...clampedLuminanceData)
            .addFloat(fadedLuminance),
        new GlslFloat(0)
            .addFloat(...clampedLuminanceData)
            .addFloat(fadedLuminance),
        new GlslFloat(1),
    ]);
    const rendering = GlslRendering.render(resultVector);
    displayImage(rendering.getDataUrl());
    lastDifferenceImage = rendering.getJsImage(captureImages);
    differenceShader.purge();
}
const IMAGE_VIEW = document.createElement("img");
IMAGE_VIEW.style.position = "absolute";
IMAGE_VIEW.style.top = "0%";
IMAGE_VIEW.style.left = "0%";
IMAGE_VIEW.style.width = "100%";
IMAGE_VIEW.style.height = "100%";
IMAGE_VIEW.style.filter = "blur(1px)";
IMAGE_VIEW.style.filter = "invert(1)";
document.body.append(IMAGE_VIEW);
function displayImage(imageDataUrl) {
    IMAGE_VIEW.src = imageDataUrl;
}
