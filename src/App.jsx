import { useEffect, useRef, useState } from "react";
import {
  FaBrush,
  FaEraser,
  FaUndo,
  FaRedo,
  FaTrash,
  FaDownload,
  FaPalette,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#111827");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("brush");

  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const isDrawing = useRef(false);

  /* ================= INITIAL CANVAS ================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const initialState = canvas.toDataURL();

    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  /* ================= SAVE CANVAS STATE ================= */

  const saveState = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const newState = canvas.toDataURL();

    setHistory((previousHistory) => {
      const trimmedHistory = previousHistory.slice(
        0,
        historyIndex + 1
      );

      const updatedHistory = [
        ...trimmedHistory,
        newState,
      ];

      // Maximum 30 history states
      if (updatedHistory.length > 30) {
        updatedHistory.shift();
      }

      return updatedHistory;
    });

    setHistoryIndex((previousIndex) => {
      return Math.min(previousIndex + 1, 29);
    });
  };

  /* ================= RESTORE STATE ================= */

  const restoreState = (imageData) => {
    const canvas = canvasRef.current;

    if (!canvas || !imageData) return;

    const context = canvas.getContext("2d");

    const image = new Image();

    image.onload = () => {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    image.src = imageData;
  };

  /* ================= UNDO ================= */

  const undo = () => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;

    setHistoryIndex(newIndex);

    restoreState(history[newIndex]);
  };

  /* ================= REDO ================= */

  const redo = () => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;

    setHistoryIndex(newIndex);

    restoreState(history[newIndex]);
  };

  /* ================= CANVAS POSITION ================= */

  const getPosition = (event) => {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  /* ================= START DRAWING ================= */

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(event);

    isDrawing.current = true;

    context.beginPath();
    context.moveTo(x, y);
  };

  /* ================= DRAW ================= */

  const draw = (event) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(event);

    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (tool === "eraser") {
      context.strokeStyle = "#ffffff";
    } else {
      context.strokeStyle = color;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  /* ================= STOP DRAWING ================= */

  const stopDrawing = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    saveState();
  };

  /* ================= CLEAR CANVAS ================= */

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    saveState();
  };

  /* ================= DOWNLOAD ================= */

  const downloadDrawing = () => {
    const canvas = canvasRef.current;

    const link = document.createElement("a");

    link.download = "my-drawing.png";

    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  /* ================= BRUSH SIZE ================= */

  const increaseBrush = () => {
    setBrushSize((size) =>
      Math.min(size + 2, 50)
    );
  };

  const decreaseBrush = () => {
    setBrushSize((size) =>
      Math.max(size - 2, 1)
    );
  };

  /* ================= PRESET COLORS ================= */

  const presetColors = [
    "#111827",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="logo-section">

          <div className="logo-icon">
            <FaBrush />
          </div>

          <div>
            <h1>Drawly</h1>
            <p>Creative Drawing Studio</p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="clear-btn"
            onClick={clearCanvas}
          >
            <FaTrash />
            <span>Clear</span>
          </button>

          <button
            className="download-btn"
            onClick={downloadDrawing}
          >
            <FaDownload />
            <span>Download</span>
          </button>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="drawing-area">

        {/* ================= TOOLBAR ================= */}

        <aside className="toolbar">

          {/* TOOLS */}

          <div className="tool-group">

            <h3>TOOLS</h3>

            <button
              className={`tool-btn ${
                tool === "brush"
                  ? "active"
                  : ""
              }`}
              onClick={() => setTool("brush")}
            >
              <FaBrush />
              <span>Brush</span>
            </button>

            <button
              className={`tool-btn ${
                tool === "eraser"
                  ? "active"
                  : ""
              }`}
              onClick={() => setTool("eraser")}
            >
              <FaEraser />
              <span>Eraser</span>
            </button>

          </div>

          <div className="divider"></div>

          {/* HISTORY */}

          <div className="tool-group">

            <h3>HISTORY</h3>

            <div className="history-buttons">

              <button
                className="history-btn"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <FaUndo />
                Undo
              </button>

              <button
                className="history-btn"
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

          <div className="divider"></div>

          {/* COLOR */}

          <div className="tool-group">

            <h3>
              <FaPalette />
              COLOR
            </h3>

            <div className="color-picker-wrapper">

              <input
                type="color"
                value={color}
                onChange={(event) => {
                  setColor(
                    event.target.value
                  );
                  setTool("brush");
                }}
              />

              <span>
                {color.toUpperCase()}
              </span>

            </div>

            {/* CURRENT COLOR */}

            <div className="color-preview">

              <div
                className="preview-circle"
                style={{
                  backgroundColor: color,
                }}
              ></div>

              <span>
                Current Color
              </span>

            </div>

            {/* PRESET COLORS */}

            <div className="preset-title">
              Preset Colors
            </div>

            <div className="preset-colors">

              {presetColors.map(
                (presetColor) => (

                  <button
                    key={presetColor}
                    className={`preset-color ${
                      color === presetColor
                        ? "selected"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        presetColor,
                    }}
                    onClick={() => {
                      setColor(
                        presetColor
                      );
                      setTool("brush");
                    }}
                    aria-label={`Select color ${presetColor}`}
                  />

                )
              )}

            </div>

          </div>

          <div className="divider"></div>

          {/* BRUSH SIZE */}

          <div className="tool-group">

            <h3>BRUSH SIZE</h3>

            <div className="size-controls">

              <button
                onClick={decreaseBrush}
                disabled={brushSize <= 1}
              >
                <FaMinus />
              </button>

              <div className="size-value">

                <strong>
                  {brushSize}
                </strong>

                <span>px</span>

              </div>

              <button
                onClick={increaseBrush}
                disabled={brushSize >= 50}
              >
                <FaPlus />
              </button>

            </div>

            <input
              className="size-slider"
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(event) =>
                setBrushSize(
                  Number(
                    event.target.value
                  )
                )
              }
            />

          </div>

        </aside>

        {/* ================= CANVAS ================= */}

        <section className="canvas-section">

          <div className="canvas-header">

            <div>

              <h2>Your Canvas</h2>

              <p>
                Express your creativity freely
              </p>

            </div>

            <div className="drawing-status">

              <span className="status-dot"></span>

              Ready to draw

            </div>

          </div>

          <div className="canvas-container">

            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          Built with <span>React</span> +{" "}
          <span>Vite</span>
        </p>

        <p>
          Draw • Create • Inspire
        </p>

      </footer>

    </div>
  );
}

export default App;