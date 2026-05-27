import { useEffect } from "react";
import { applyConvolution } from "../utils/imageProcessing";

export function useFilteredImage({
  imageSrc,
  originalCanvasRef,
  resultCanvasRef,
  kernel,
  divisor,
  bias,
  absoluteResponse,
  grayscaleOutput,
}) {
  useEffect(() => {
    if (!imageSrc) return;

    const image = new Image();

    image.onload = () => {
      const maxWidth = 640;
      const scale = Math.min(1, maxWidth / image.width);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const originalCanvas = originalCanvasRef.current;
      const resultCanvas = resultCanvasRef.current;
      if (!originalCanvas || !resultCanvas) return;

      const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
      const resultCtx = resultCanvas.getContext("2d");

      originalCanvas.width = width;
      originalCanvas.height = height;
      resultCanvas.width = width;
      resultCanvas.height = height;

      originalCtx.clearRect(0, 0, width, height);
      originalCtx.drawImage(image, 0, 0, width, height);

      const sourceData = originalCtx.getImageData(0, 0, width, height);
      const filteredData = applyConvolution(
        sourceData,
        kernel.map(Number),
        Number(divisor),
        Number(bias),
        absoluteResponse,
        grayscaleOutput,
      );

      resultCtx.putImageData(filteredData, 0, 0);
    };

    image.src = imageSrc;
  }, [
    imageSrc,
    originalCanvasRef,
    resultCanvasRef,
    kernel,
    divisor,
    bias,
    absoluteResponse,
    grayscaleOutput,
  ]);
}
