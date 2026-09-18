import { useEffect, useRef, useState } from "react";
import {
  FaBrush,
  FaPencilAlt,
  FaEraser,
  FaFillDrip,
  FaMinus,
  FaUndo,
  FaRedo,
  FaTrash,
  FaDownload,
  FaPalette,
  FaPlus,
  FaSlash,
  FaSquare,
  FaCircle,
  FaArrowRight,
} from "react-icons/fa";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#111827");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("brush");

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const isDrawing = useRef(false);

  // Used for shape drawing
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

  // --------------------------------------------------
  // CANVAS INITIALIZATION
  // --------------------------------------------------

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
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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

  // --------------------------------------------------
  // HISTORY
  // --------------------------------------------------

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

    // Keep maximum 30 history states
    if (newHistory.length > 30) {
      newHistory = newHistory.slice(newHistory.length - 30);
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.src = state;
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;

    const newIndex = historyIndexRef.current - 1;

    historyIndexRef.current = newIndex;

    setHistoryIndex(newIndex);

    restoreState(historyRef.current[newIndex]);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      return;
    }

    const newIndex = historyIndexRef.current + 1;

    historyIndexRef.current = newIndex;

    setHistoryIndex(newIndex);

    restoreState(historyRef.current[newIndex]);
  };

  // --------------------------------------------------
  // GET CANVAS POSITION
  // --------------------------------------------------

  const getCanvasPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // --------------------------------------------------
  // START DRAWING
  // --------------------------------------------------

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } = getCanvasPosition(event);

    // Fill tool
    if (tool === "fill") {
      floodFill(x, y);
      return;
    }

    isDrawing.current = true;

    startPoint.current = { x, y };

    // Save current canvas before drawing shape
    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "arrow"
    ) {
      previewImage.current = ctx.getImageData(
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
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }

    // Pencil uses a smaller, harder line
    if (tool === "pencil") {
      ctx.lineWidth = Math.max(1, brushSize / 2);
    }
  };

  // --------------------------------------------------
  // DRAW
  // --------------------------------------------------

  const draw = (event) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const { x, y } = getCanvasPosition(event);

    // Brush / Pencil / Eraser
    if (
      tool === "brush" ||
      tool === "pencil" ||
      tool === "eraser"
    ) {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    // Shape preview
    if (
      tool === "line" ||
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "arrow"
    ) {
      // Restore original canvas before drawing preview
      if (previewImage.current) {
        ctx.putImageData(previewImage.current, 0, 0);
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        drawLine(ctx, startPoint.current.x, startPoint.current.y, x, y);
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

  // --------------------------------------------------
  // STOP DRAWING
  // --------------------------------------------------

  const stopDrawing = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.closePath();

    ctx.globalCompositeOperation = "source-over";

    saveState();

    previewImage.current = null;
  };

  // --------------------------------------------------
  // LINE
  // --------------------------------------------------

  const drawLine = (ctx, startX, startY, endX, endY) => {
    ctx.beginPath();

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    ctx.stroke();
  };

  // --------------------------------------------------
  // RECTANGLE
  // --------------------------------------------------

  const drawRectangle = (ctx, startX, startY, endX, endY) => {
    const width = endX - startX;
    const height = endY - startY;

    ctx.beginPath();

    ctx.rect(startX, startY, width, height);

    ctx.stroke();
  };

  // --------------------------------------------------
  // CIRCLE
  // --------------------------------------------------

  const drawCircle = (ctx, startX, startY, endX, endY) => {
    const radiusX = Math.abs(endX - startX) / 2;
    const radiusY = Math.abs(endY - startY) / 2;

    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;

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

  // --------------------------------------------------
  // ARROW
  // --------------------------------------------------

  const drawArrow = (ctx, startX, startY, endX, endY) => {
    const headLength = Math.max(10, brushSize * 4);

    const angle = Math.atan2(endY - startY, endX - startX);

    // Main line
    ctx.beginPath();

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    ctx.stroke();

    // Arrow head
    ctx.beginPath();

    ctx.moveTo(endX, endY);

    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );

    ctx.moveTo(endX, endY);

    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
  };

  // --------------------------------------------------
  // FLOOD FILL
  // --------------------------------------------------

  const floodFill = (startX, startY) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pixels = imageData.data;

    const x = Math.floor(startX);
    const y = Math.floor(startY);

    const startIndex = (y * canvas.width + x) * 4;

    const targetColor = {
      r: pixels[startIndex],
      g: pixels[startIndex + 1],
      b: pixels[startIndex + 2],
      a: pixels[startIndex + 3],
    };

    const fillColor = hexToRgb(color);

    if (
      targetColor.r === fillColor.r &&
      targetColor.g === fillColor.g &&
      targetColor.b === fillColor.b &&
      targetColor.a === 255
    ) {
      return;
    }

    const pixelMatches = (index) => {
      return (
        pixels[index] === targetColor.r &&
        pixels[index + 1] === targetColor.g &&
        pixels[index + 2] === targetColor.b &&
        pixels[index + 3] === targetColor.a
      );
    };

    const stack = [[x, y]];

    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop();

      if (
        currentX < 0 ||
        currentX >= canvas.width ||
        currentY < 0 ||
        currentY >= canvas.height
      ) {
        continue;
      }

      const index =
        (currentY * canvas.width + currentX) * 4;

      if (!pixelMatches(index)) {
        continue;
      }

      pixels[index] = fillColor.r;
      pixels[index + 1] = fillColor.g;
      pixels[index + 2] = fillColor.b;
      pixels[index + 3] = 255;

      stack.push([currentX + 1, currentY]);
      stack.push([currentX - 1, currentY]);
      stack.push([currentX, currentY + 1]);
      stack.push([currentX, currentY - 1]);
    }

    ctx.putImageData(imageData, 0, 0);

    saveState();
  };

  // --------------------------------------------------
  // HEX TO RGB
  // --------------------------------------------------

  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");

    const bigint = parseInt(cleanHex, 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // --------------------------------------------------
  // CLEAR CANVAS
  // --------------------------------------------------

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    saveState();
  };

  // --------------------------------------------------
  // DOWNLOAD
  // --------------------------------------------------

  const downloadCanvas = () => {
    const canvas = canvasRef.current;

    const link = document.createElement("a");

    link.download = "drawly-drawing.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  // --------------------------------------------------
  // TOOL BUTTON
  // --------------------------------------------------

  const selectTool = (selectedTool) => {
    setTool(selectedTool);
  };

  // --------------------------------------------------
  // BRUSH SIZE
  // --------------------------------------------------

  const decreaseBrushSize = () => {
    setBrushSize((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const increaseBrushSize = () => {
    setBrushSize((previous) =>
      Math.min(50, previous + 1)
    );
  };

  // --------------------------------------------------
  // TOOL STATUS
  // --------------------------------------------------

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

      default:
        return "Ready to draw";
    }
  };

  return (
    <div className="app">

      {/* ============================================
          HEADER
      ============================================ */}

      <header className="header">
        <div className="brand">
          <div className="logo">
            <FaBrush />
          </div>

          <div>
            <h1>Drawly</h1>
            <p>Simple. Creative. Yours.</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-button"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <FaUndo />
          </button>

          <button
            className="icon-button"
            onClick={redo}
            disabled={
              historyIndex >= history.length - 1
            }
            title="Redo"
          >
            <FaRedo />
          </button>

          <button
            className="download-button"
            onClick={downloadCanvas}
          >
            <FaDownload />
            Download
          </button>
        </div>
      </header>

      {/* ============================================
          MAIN
      ============================================ */}

      <main className="main-container">

        {/* ==========================================
            TOOLBAR
        ========================================== */}

        <aside className="toolbar">

          {/* Tools */}

          <div className="toolbar-section">

            <div className="section-title">
              <span>Tools</span>
            </div>

            <div className="tool-grid">

              {/* Pencil */}

              <button
                className={`tool-button ${
                  tool === "pencil" ? "active" : ""
                }`}
                onClick={() => selectTool("pencil")}
              >
                <FaPencilAlt />
                <span>Pencil</span>
              </button>

              {/* Brush */}

              <button
                className={`tool-button ${
                  tool === "brush" ? "active" : ""
                }`}
                onClick={() => selectTool("brush")}
              >
                <FaBrush />
                <span>Brush</span>
              </button>

              {/* Eraser */}

              <button
                className={`tool-button ${
                  tool === "eraser" ? "active" : ""
                }`}
                onClick={() => selectTool("eraser")}
              >
                <FaEraser />
                <span>Eraser</span>
              </button>

              {/* Fill */}

              <button
                className={`tool-button ${
                  tool === "fill" ? "active" : ""
                }`}
                onClick={() => selectTool("fill")}
              >
                <FaFillDrip />
                <span>Fill</span>
              </button>

              {/* Line */}

              <button
                className={`tool-button ${
                  tool === "line" ? "active" : ""
                }`}
                onClick={() => selectTool("line")}
              >
                <FaSlash />
                <span>Line</span>
              </button>

              {/* Rectangle */}

              <button
                className={`tool-button ${
                  tool === "rectangle" ? "active" : ""
                }`}
                onClick={() =>
                  selectTool("rectangle")
                }
              >
                <FaSquare />
                <span>Rectangle</span>
              </button>

              {/* Circle */}

              <button
                className={`tool-button ${
                  tool === "circle" ? "active" : ""
                }`}
                onClick={() => selectTool("circle")}
              >
                <FaCircle />
                <span>Circle</span>
              </button>

              {/* Arrow */}

              <button
                className={`tool-button ${
                  tool === "arrow" ? "active" : ""
                }`}
                onClick={() => selectTool("arrow")}
              >
                <FaArrowRight />
                <span>Arrow</span>
              </button>

            </div>

          </div>

          {/* ========================================
              HISTORY
          ======================================== */}

          <div className="toolbar-section">

            <div className="section-title">
              <span>History</span>
            </div>

            <div className="history-buttons">

              <button
                className="secondary-button"
                onClick={undo}
                disabled={historyIndex <= 0}
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

          {/* ========================================
              COLOR
          ======================================== */}

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
                  setColor(event.target.value)
                }
                className="color-picker"
              />

              <div
                className="selected-color"
                style={{
                  backgroundColor: color,
                }}
              >
                <span>{color.toUpperCase()}</span>
              </div>

            </div>

            <div className="preset-colors">

              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={`color-swatch ${
                    color === presetColor
                      ? "selected"
                      : ""
                  }`}
                  style={{
                    backgroundColor: presetColor,
                  }}
                  onClick={() =>
                    setColor(presetColor)
                  }
                  title={presetColor}
                />
              ))}

            </div>

          </div>

          {/* ========================================
              BRUSH SIZE
          ======================================== */}

          <div className="toolbar-section">

            <div className="section-title">
              <span>Size</span>
            </div>

            <div className="size-controls">

              <button
                className="size-button"
                onClick={decreaseBrushSize}
                disabled={brushSize <= 1}
              >
                <FaMinus />
              </button>

              <div className="size-value">
                <span>{brushSize}</span>
                <small>px</small>
              </div>

              <button
                className="size-button"
                onClick={increaseBrushSize}
                disabled={brushSize >= 50}
              >
                <FaPlus />
              </button>

            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(event) =>
                setBrushSize(
                  Number(event.target.value)
                )
              }
              className="size-slider"
            />

          </div>

          {/* ========================================
              CLEAR
          ======================================== */}

          <div className="toolbar-section clear-section">

            <button
              className="clear-button"
              onClick={clearCanvas}
            >
              <FaTrash />
              Clear Canvas
            </button>

          </div>

        </aside>

        {/* ==========================================
            CANVAS AREA
        ========================================== */}

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
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className={`drawing-canvas tool-${tool}`}
            />

          </div>

        </section>

      </main>

      {/* ============================================
          FOOTER
      ============================================ */}

      <footer className="footer">
        <p>
          Drawly • Create something amazing ✨
        </p>
      </footer>

    </div>
  );
}

export default App;