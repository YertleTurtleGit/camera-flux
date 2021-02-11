"use strict";

const webcam: Webcam = new Webcam([WIDTH, HEIGHT], webCamIsReady);
webcam.startStreaming();

function webCamIsReady(): void {
   captureImages();
}

const capturedImages: HTMLImageElement[] = Array(IMAGE_BUFFER_LENGTH);
function captureImages(): void {
   for (let i = 0; i < capturedImages.length; i++) {
      capturedImages[i] = new Image();
      capturedImages[i].addEventListener("load", imageCaptured);
      setTimeout(captureImage.bind(null, i), IMAGE_CAPTURE_DELTA * i);
   }
}

function captureImage(imageIndex: number) {
   capturedImages[imageIndex].src = webcam.takePicture();
}

let capturedImagesCount: number = 0;
function imageCaptured(): void {
   capturedImagesCount++;
   if (capturedImagesCount === IMAGE_BUFFER_LENGTH) {
      capturedImagesCount = 0;
      renderDifferenceImage(capturedImages, lastDifferenceImage);
   }
}

const GLSL_FADE_FACTOR: GlslFloat = new GlslFloat(FADE_FACTOR);
let lastDifferenceImage: HTMLImageElement = new Image(WIDTH, HEIGHT);
function renderDifferenceImage(
   images: HTMLImageElement[],
   fadeFrom: HTMLImageElement
) {
   const differenceShader = new Shader();
   differenceShader.bind();

   const firstLuminance: GlslFloat = GlslImage.load(
      images[0]
   ).getLuminanceFloat();

   const jsMin: number = 0.05;
   const min: GlslFloat = new GlslFloat(jsMin);
   const factor: GlslFloat = new GlslFloat(1 / jsMin);

   const clampedLuminanceData: GlslFloat[] = new Array(images.length - 1);
   for (let i = 1; i < images.length; i++) {
      const fractionFactor: GlslFloat = new GlslFloat(
         1 / ((images.length - i) * 10)
      );
      const luminance: GlslFloat = GlslImage.load(
         images[i]
      ).getLuminanceFloat();
      const luminanceDelta: GlslFloat = firstLuminance
         .subtractFloat(luminance)
         .absolute();
      const luminanceDeltaClamped: GlslFloat = luminanceDelta
         .maximum(min)
         .subtractFloat(min)
         .multiplyFloat(factor);
      clampedLuminanceData[i - 1] = luminanceDeltaClamped.multiplyFloat(
         fractionFactor
      );
   }

   const fadedLuminance: GlslFloat = GlslImage.load(fadeFrom)
      .getLuminanceFloat()
      .multiplyFloat(GLSL_FADE_FACTOR);

   const resultVector: GlslVector4 = new GlslVector4([
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

   const rendering: GlslRendering = GlslRendering.render(resultVector);

   displayImage(rendering.getDataUrl());
   lastDifferenceImage = rendering.getJsImage(captureImages);

   differenceShader.purge();
}

const IMAGE_VIEW: HTMLImageElement = document.createElement("img");
IMAGE_VIEW.style.position = "absolute";
IMAGE_VIEW.style.top = "0%";
IMAGE_VIEW.style.left = "0%";
IMAGE_VIEW.style.width = "100%";
IMAGE_VIEW.style.height = "100%";
IMAGE_VIEW.style.filter = "blur(1px)";
IMAGE_VIEW.style.filter = "invert(1)";
document.body.append(IMAGE_VIEW);
function displayImage(imageDataUrl: string): void {
   IMAGE_VIEW.src = imageDataUrl;
}
