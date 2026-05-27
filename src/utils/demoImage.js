export function createDemoImage(width = 640, height = 400) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#e7f6ff");
  gradient.addColorStop(0.48, "#fff7cf");
  gradient.addColorStop(1, "#ffe7ef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(18, 32, 58, 0.92)";
  ctx.fillRect(70, 82, 160, 160);

  ctx.fillStyle = "rgba(28, 111, 210, 0.9)";
  ctx.beginPath();
  ctx.arc(390, 162, 86, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(218, 59, 82, 0.9)";
  ctx.beginPath();
  ctx.moveTo(320, 310);
  ctx.lineTo(510, 276);
  ctx.lineTo(575, 365);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(18, 32, 58, 0.8)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(70, 305);
  ctx.lineTo(230, 305);
  ctx.lineTo(230, 365);
  ctx.lineTo(70, 365);
  ctx.stroke();

  ctx.fillStyle = "rgba(18, 32, 58, 0.9)";
  ctx.font = "bold 30px Inter, Arial, sans-serif";
  ctx.fillText("Filter Lab", 72, 55);
  ctx.font = "18px Inter, Arial, sans-serif";
  ctx.fillText("Click shapes to inspect local pixel neighborhoods", 72, 390);

  return canvas.toDataURL("image/png");
}
