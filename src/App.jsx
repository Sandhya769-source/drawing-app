import { useEffect, useRef, useState } from "react";
import {
  FaBrush,
  FaPencilAlt,
  FaEraser,
  FaFillDrip,
  FaSlash,
  FaSquare,
  FaCircle,
  FaArrowRight,
  FaFont,
  FaUndo,
  FaRedo,
  FaTrash,
  FaDownload,
  FaPalette,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#111827");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("brush");
  const [fontSize, setFontSize] = useState(32);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const isDrawing = useRef(false);

  const startPoint = useRef({ x: 0, y: 0 });
  const previewImage = useRef(null);

  const presetColors = [
    "#111827",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#ffffff",
    "#6b7280",
    "#000000",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const existingImage = canvas.toDataURL();

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const image = new Image();

      image.onload = () => {
        if (existingImage !== "data:,") {
          ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      };

      image.src = existingImage;
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    saveInitialState();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const saveInitialState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialState = canvas.toDataURL();

    historyRef.current = [initialState];
    historyIndexRef.current = 0;

    setHistory([initialState]);
    setHistoryIndex(0);
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newState = canvas.toDataURL();

    let newHistory = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    );

    newHistory.push(newState);

    if (newHistory.length > 30) {
      newHistory = newHistory.slice(
        newHistory.length - 30
      );
    }

    const newIndex = newHistory.length - 1;

    historyRef.current = newHistory;
    historyIndexRef.current = newIndex;

    setHistory(newHistory);
    setHistoryIndex(newIndex);
  };

  const restoreState = (state) => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext("2d");

    const image = new Image();

    image.onload = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    image.src = state;
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;

    const newIndex =
      historyIndexRef.current - 1;

    historyIndexRef.current = newIndex;
    setHistoryIndex(newIndex);

    restoreState(historyRef.current[newIndex]);
  };

  const redo = () => {
    if (
      historyIndexRef.current >=
      historyRef.current.length - 1
    ) {
      return;
    }

    const newIndex =
      historyIndexRef.current + 1;

    historyIndexRef.current = newIndex;
    setHistoryIndex(newIndex);

    restoreState(historyRef.current[newIndex]);
  };

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } =
      getCanvasPosition(event);

    if (tool === "fill") {
      floodFill(x, y);
      return;
    }

    if (tool === "text") {
      addText(x, y);
      return;
    }

    isDrawing.current = true;
    startPoint.current = { x, y };

    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "arrow"
    ) {
      previewImage.current =
        ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation =
        "destination-out";
    } else {
      ctx.globalCompositeOperation =
        "source-over";

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }

    if (tool === "pencil") {
      ctx.lineWidth = Math.max(
        1,
        brushSize / 2
      );
    }
  };

  const draw = (event) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } =
      getCanvasPosition(event);

    if (
      tool === "brush" ||
      tool === "pencil" ||
      tool === "eraser"
    ) {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "arrow"
    ) {
      if (previewImage.current) {
        ctx.putImageData(
          previewImage.current,
          0,
          0
        );
      }

      ctx.globalCompositeOperation =
        "source-over";

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        drawLine(
          ctx,
          startPoint.current.x,
          startPoint.current.y,
          x,
          y
        );
      }

      if (tool === "rectangle") {
        drawRectangle(
          ctx,
          startPoint.current.x,
          startPoint.current.y,
          x,
          y
        );
      }

      if (tool === "circle") {
        drawCircle(
          ctx,
          startPoint.current.x,
          startPoint.current.y,
          x,
          y
        );
      }

      if (tool === "arrow") {
        drawArrow(
          ctx,
          startPoint.current.x,
          startPoint.current.y,
          x,
          y
        );
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.closePath();
    ctx.globalCompositeOperation =
      "source-over";

    saveState();

    previewImage.current = null;
  };

  const addText = (x, y) => {
    const text = window.prompt(
      "Enter your text:"
    );

    if (!text || !text.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation =
      "source-over";

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
    ctx.textBaseline = "top";

    ctx.fillText(
      text.trim(),
      x,
      y
    );

    saveState();
  };

  const drawLine = (
    ctx,
    startX,
    startY,
    endX,
    endY
  ) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const drawRectangle = (
    ctx,
    startX,
    startY,
    endX,
    endY
  ) => {
    const width = endX - startX;
    const height = endY - startY;

    ctx.beginPath();
    ctx.rect(
      startX,
      startY,
      width,
      height
    );
    ctx.stroke();
  };

  const drawCircle = (
    ctx,
    startX,
    startY,
    endX,
    endY
  ) => {
    const radiusX =
      Math.abs(endX - startX) / 2;

    const radiusY =
      Math.abs(endY - startY) / 2;

    const centerX =
      (startX + endX) / 2;

    const centerY =
      (startY + endY) / 2;

    ctx.beginPath();

    ctx.ellipse(
      centerX,
      centerY,
      radiusX,
      radiusY,
      0,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  };

  const drawArrow = (
    ctx,
    startX,
    startY,
    endX,
    endY
  ) => {
    const headLength = Math.max(
      10,
      brushSize * 4
    );

    const angle = Math.atan2(
      endY - startY,
      endX - startX
    );

    ctx.beginPath();

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(endX, endY);

    ctx.lineTo(
      endX -
        headLength *
          Math.cos(
            angle - Math.PI / 6
          ),
      endY -
        headLength *
          Math.sin(
            angle - Math.PI / 6
          )
    );

    ctx.moveTo(endX, endY);

    ctx.lineTo(
      endX -
        headLength *
          Math.cos(
            angle + Math.PI / 6
          ),
      endY -
        headLength *
          Math.sin(
            angle + Math.PI / 6
          )
    );

    ctx.stroke();
  };

  const floodFill = (
    startX,
    startY
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageData =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const pixels = imageData.data;

    const x = Math.floor(startX);
    const y = Math.floor(startY);

    const startIndex =
      (y * canvas.width + x) * 4;

    const targetColor = {
      r: pixels[startIndex],
      g: pixels[startIndex + 1],
      b: pixels[startIndex + 2],
      a: pixels[startIndex + 3],
    };

    const fillColor =
      hexToRgb(color);

    if (
      targetColor.r === fillColor.r &&
      targetColor.g === fillColor.g &&
      targetColor.b === fillColor.b &&
      targetColor.a === 255
    ) {
      return;
    }

    const pixelMatches = (
      index
    ) => {
      return (
        pixels[index] ===
          targetColor.r &&
        pixels[index + 1] ===
          targetColor.g &&
        pixels[index + 2] ===
          targetColor.b &&
        pixels[index + 3] ===
          targetColor.a
      );
    };

    const stack = [[x, y]];

    while (stack.length > 0) {
      const [
        currentX,
        currentY,
      ] = stack.pop();

      if (
        currentX < 0 ||
        currentX >= canvas.width ||
        currentY < 0 ||
        currentY >= canvas.height
      ) {
        continue;
      }

      const index =
        (currentY * canvas.width +
          currentX) *
        4;

      if (!pixelMatches(index)) {
        continue;
      }

      pixels[index] =
        fillColor.r;

      pixels[index + 1] =
        fillColor.g;

      pixels[index + 2] =
        fillColor.b;

      pixels[index + 3] = 255;

      stack.push([
        currentX + 1,
        currentY,
      ]);

      stack.push([
        currentX - 1,
        currentY,
      ]);

      stack.push([
        currentX,
        currentY + 1,
      ]);

      stack.push([
        currentX,
        currentY - 1,
      ]);
    }

    ctx.putImageData(
      imageData,
      0,
      0
    );

    saveState();
  };

  const hexToRgb = (hex) => {
    const cleanHex =
      hex.replace("#", "");

    const bigint = parseInt(
      cleanHex,
      16
    );

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation =
      "source-over";

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    saveState();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;

    const link =
      document.createElement("a");

    link.download =
      "drawly-drawing.png";

    link.href =
      canvas.toDataURL(
        "image/png"
      );

    link.click();
  };

  const selectTool = (
    selectedTool
  ) => {
    setTool(selectedTool);
  };

  const decreaseBrushSize = () => {
    setBrushSize(
      (previous) =>
        Math.max(
          1,
          previous - 1
        )
    );
  };

  const increaseBrushSize = () => {
    setBrushSize(
      (previous) =>
        Math.min(
          50,
          previous + 1
        )
    );
  };

  const decreaseFontSize = () => {
    setFontSize(
      (previous) =>
        Math.max(
          10,
          previous - 2
        )
    );
  };

  const increaseFontSize = () => {
    setFontSize(
      (previous) =>
        Math.min(
          100,
          previous + 2
        )
    );
  };

  const getToolStatus = () => {
    switch (tool) {
      case "pencil":
        return "Pencil ready";

      case "brush":
        return "Brush ready";

      case "eraser":
        return "Eraser ready";

      case "fill":
        return "Fill ready";

      case "line":
        return "Line ready";

      case "rectangle":
        return "Rectangle ready";

      case "circle":
        return "Circle ready";

      case "arrow":
        return "Arrow ready";

      case "text":
        return "Click the canvas to add text";

      default:
        return "Ready to draw";
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">
            <FaBrush />
          </div>

          <div>
            <h1>Drawly</h1>
            <p>
              Simple. Creative. Yours.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-button"
            onClick={undo}
            disabled={
              historyIndex <= 0
            }
            title="Undo"
          >
            <FaUndo />
          </button>

          <button
            className="icon-button"
            onClick={redo}
            disabled={
              historyIndex >=
              history.length - 1
            }
            title="Redo"
          >
            <FaRedo />
          </button>

          <button
            className="download-button"
            onClick={
              downloadCanvas
            }
          >
            <FaDownload />
            Download
          </button>
        </div>
      </header>

      <main className="main-container">
        <aside className="toolbar">
          <div className="toolbar-section">
            <div className="section-title">
              <span>Tools</span>
            </div>

            <div className="tool-grid">
              <button
                className={`tool-button ${
                  tool === "pencil"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "pencil"
                  )
                }
              >
                <FaPencilAlt />
                <span>Pencil</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "brush"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "brush"
                  )
                }
              >
                <FaBrush />
                <span>Brush</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "eraser"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "eraser"
                  )
                }
              >
                <FaEraser />
                <span>Eraser</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "fill"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "fill"
                  )
                }
              >
                <FaFillDrip />
                <span>Fill</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "line"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "line"
                  )
                }
              >
                <FaSlash />
                <span>Line</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "rectangle"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "rectangle"
                  )
                }
              >
                <FaSquare />
                <span>
                  Rectangle
                </span>
              </button>

              <button
                className={`tool-button ${
                  tool === "circle"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "circle"
                  )
                }
              >
                <FaCircle />
                <span>Circle</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "arrow"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "arrow"
                  )
                }
              >
                <FaArrowRight />
                <span>Arrow</span>
              </button>

              <button
                className={`tool-button ${
                  tool === "text"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selectTool(
                    "text"
                  )
                }
              >
                <FaFont />
                <span>Text</span>
              </button>
            </div>
          </div>

          <div className="toolbar-section">
            <div className="section-title">
              <span>History</span>
            </div>

            <div className="history-buttons">
              <button
                className="secondary-button"
                onClick={undo}
                disabled={
                  historyIndex <= 0
                }
              >
                <FaUndo />
                Undo
              </button>

              <button
                className="secondary-button"
                onClick={redo}
                disabled={
                  historyIndex >=
                  history.length - 1
                }
              >
                <FaRedo />
                Redo
              </button>
            </div>
          </div>

          <div className="toolbar-section">
            <div className="section-title">
              <FaPalette />
              <span>Color</span>
            </div>

            <div className="color-picker-wrapper">
              <input
                type="color"
                value={color}
                onChange={(event) =>
                  setColor(
                    event.target.value
                  )
                }
                className="color-picker"
              />

              <div
                className="selected-color"
                style={{
                  backgroundColor:
                    color,
                }}
              >
                <span>
                  {color.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="preset-colors">
              {presetColors.map(
                (presetColor) => (
                  <button
                    key={
                      presetColor
                    }
                    className={`color-swatch ${
                      color ===
                      presetColor
                        ? "selected"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        presetColor,
                    }}
                    onClick={() =>
                      setColor(
                        presetColor
                      )
                    }
                    title={
                      presetColor
                    }
                  />
                )
              )}
            </div>
          </div>

          {tool !== "text" && (
            <div className="toolbar-section">
              <div className="section-title">
                <span>Size</span>
              </div>

              <div className="size-controls">
                <button
                  className="size-button"
                  onClick={
                    decreaseBrushSize
                  }
                  disabled={
                    brushSize <= 1
                  }
                >
                  <FaMinus />
                </button>

                <div className="size-value">
                  <span>
                    {brushSize}
                  </span>

                  <small>px</small>
                </div>

                <button
                  className="size-button"
                  onClick={
                    increaseBrushSize
                  }
                  disabled={
                    brushSize >= 50
                  }
                >
                  <FaPlus />
                </button>
              </div>

              <input
                type="range"
                min="1"
                max="50"
                value={
                  brushSize
                }
                onChange={(
                  event
                ) =>
                  setBrushSize(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="size-slider"
              />
            </div>
          )}

          {tool === "text" && (
            <div className="toolbar-section">
              <div className="section-title">
                <span>
                  Text Size
                </span>
              </div>

              <div className="size-controls">
                <button
                  className="size-button"
                  onClick={
                    decreaseFontSize
                  }
                  disabled={
                    fontSize <= 10
                  }
                >
                  <FaMinus />
                </button>

                <div className="size-value">
                  <span>
                    {fontSize}
                  </span>

                  <small>px</small>
                </div>

                <button
                  className="size-button"
                  onClick={
                    increaseFontSize
                  }
                  disabled={
                    fontSize >= 100
                  }
                >
                  <FaPlus />
                </button>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={
                  fontSize
                }
                onChange={(
                  event
                ) =>
                  setFontSize(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="size-slider"
              />
            </div>
          )}

          <div className="toolbar-section clear-section">
            <button
              className="clear-button"
              onClick={
                clearCanvas
              }
            >
              <FaTrash />
              Clear Canvas
            </button>
          </div>
        </aside>

        <section className="canvas-section">
          <div className="canvas-header">
            <div>
              <h2>Canvas</h2>
              <p>
                {getToolStatus()}
              </p>
            </div>

            <div className="canvas-info">
              {canvasRef.current
                ? `${canvasRef.current.width} × ${canvasRef.current.height}`
                : "Canvas"}
            </div>
          </div>

          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onPointerDown={
                startDrawing
              }
              onPointerMove={draw}
              onPointerUp={
                stopDrawing
              }
              onPointerLeave={
                stopDrawing
              }
              className={`drawing-canvas tool-${tool}`}
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Drawly • Create something
          amazing ✨
        </p>
      </footer>
    </div>
  );
}

export default App;