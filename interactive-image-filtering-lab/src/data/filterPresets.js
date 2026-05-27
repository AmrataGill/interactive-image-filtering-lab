export const PRESETS = {
  identity: {
    label: "Identity",
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    divisor: 1,
    bias: 0,
    summary: "No change",
    description:
      "The center value is 1 and every neighbor is 0, so each output pixel keeps its original color.",
    concept: "Use this as the baseline before trying stronger filters.",
  },
  blur: {
    label: "Box Blur",
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    divisor: 9,
    bias: 0,
    summary: "Smooths noise",
    description:
      "Every nearby pixel contributes equally. Dividing by 9 turns the sum into an average.",
    concept: "Averaging nearby pixels softens sharp changes.",
  },
  sharpen: {
    label: "Sharpen",
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    divisor: 1,
    bias: 0,
    summary: "Boosts detail",
    description:
      "The center pixel is strengthened while nearby pixels are subtracted, making local changes stand out.",
    concept: "Sharpening is original image plus extra high-frequency detail.",
  },
  vertical: {
    label: "Vertical Edges",
    kernel: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    divisor: 1,
    bias: 128,
    summary: "Finds left/right changes",
    description:
      "This compares the left side of a small region with the right side. A bias of 128 makes negative responses visible.",
    concept: "Bright-to-dark or dark-to-bright changes become strong edge marks.",
  },
  horizontal: {
    label: "Horizontal Edges",
    kernel: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    divisor: 1,
    bias: 128,
    summary: "Finds top/bottom changes",
    description:
      "This compares the top row of a small region with the bottom row to reveal horizontal boundaries.",
    concept: "Edges appear where brightness changes across rows.",
  },
  outline: {
    label: "All-direction Edges",
    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    divisor: 1,
    bias: 128,
    summary: "Highlights boundaries",
    description:
      "The center pixel is compared against all eight neighbors, so sudden changes in any direction stand out.",
    concept: "This is useful for seeing object outlines and contours.",
  },
  emboss: {
    label: "Emboss",
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    divisor: 1,
    bias: 128,
    summary: "Creates relief",
    description:
      "Negative weights on one diagonal and positive weights on the other create a raised texture effect.",
    concept: "The bias moves the result back into visible gray values.",
  },
};
