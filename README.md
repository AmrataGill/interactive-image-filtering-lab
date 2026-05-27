# Interactive Image Filtering Lab

A React learning tool that helps students understand image filtering and 3x3 convolution kernels. Students can upload an image, choose common filters, edit kernel values, compare the original and filtered result, and inspect the pixel math behind a selected patch.
# Interactive Image Filtering Lab

Live Demo: https://AmrataGill.github.io/interactive-image-filtering-lab/

An interactive React + Vite web app that helps students understand image filtering concepts such as blur, sharpening, edge detection, and custom 3x3 kernels.

## What Students Can Learn

- How a 3x3 kernel changes each pixel in an image
- Why averaging kernels create blur
- How sharpening kernels emphasize detail
- How edge detection compares neighboring pixels
- What divisor and bias do in a convolution operation
- How pixel neighborhoods are multiplied by kernel weights

## Features

- Demo image included for quick experimentation
- Image upload support
- Preset filters:
  - Identity
  - Box Blur
  - Sharpen
  - Vertical Edges
  - Horizontal Edges
  - All-direction Edges
  - Emboss
- Editable 3x3 kernel grid
- Divisor and bias controls
- Optional absolute edge response
- Optional grayscale output
- Before/after comparison slider
- Pixel math explorer for a clicked 3x3 patch
- Download button for the filtered image

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL printed in the terminal, usually:

```text
http://127.0.0.1:5173/
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd run dev
```

## Check Code Quality

Run ESLint:

```bash
npm run lint
```

Or on Windows PowerShell:

```bash
npm.cmd run lint
```

## Project Structure

```text
src/
  App.jsx                     Main page layout and state
  App.css                     Main application styling
  index.css                   Global styles
  components/                 Reusable UI sections
  data/filterPresets.js       Filter presets and explanations
  hooks/useFilteredImage.js   Canvas rendering and filtering hook
  utils/demoImage.js          Generated demo image
  utils/imageProcessing.js    Convolution and pixel patch logic
```

## Teaching Flow

1. Start with the demo image.
2. Select Identity to show that a kernel can leave pixels unchanged.
3. Select Box Blur and explain averaging.
4. Select Sharpen and compare center-positive, neighbor-negative weights.
5. Select an edge filter and explain how opposite sides of the patch are compared.
6. Click the original image to show the 3x3 patch math.
7. Ask students to edit the kernel and predict the result before observing it.

## Notes

The app uses the HTML canvas API to read pixels and write filtered image data. The convolution implementation clamps pixel values to the visible 0-255 range.
