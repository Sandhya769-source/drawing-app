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

  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const { x, y } = getPosition(event);

    isDrawing.current = true;

    context.beginPath();
    context.moveTo(x, y);
  };

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

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;

    const link = document.createElement("a");
    link.download = "my-drawing.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  const increaseBrush = () => {
    setBrushSize((size) => Math.min(size + 2, 50));
  };

  const decreaseBrush = () => {
    setBrushSize((size) => Math.max(size - 2, 1));
  };

  return (
    <div className="app">
      {/* Header */}
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
          <button className="clear-btn" onClick={clearCanvas}>
            <FaTrash />
            Clear
          </button>

          <button className="download-btn" onClick={downloadDrawing}>
            <FaDownload />
            Download
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="drawing-area">
        {/* Toolbar */}
        <aside className="toolbar">
          <div className="tool-group">
            <h3>TOOLS</h3>

            <button
              className={`tool-btn ${tool === "brush" ? "active" : ""}`}
              onClick={() => setTool("brush")}
            >
              <FaBrush />
              <span>Brush</span>
            </button>

            <button
              className={`tool-btn ${tool === "eraser" ? "active" : ""}`}
              onClick={() => setTool("eraser")}
            >
              <FaEraser />
              <span>Eraser</span>
            </button>
          </div>

          <div className="divider"></div>

          {/* Color */}
          <div className="tool-group">
            <h3>
              <FaPalette />
              COLOR
            </h3>

            <div className="color-picker-wrapper">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />

              <span>{color.toUpperCase()}</span>
            </div>

            <div className="color-preview">
              <div
                className="preview-circle"
                style={{ backgroundColor: color }}
              ></div>

              <span>Current Color</span>
            </div>
          </div>

          <div className="divider"></div>

          {/* Brush Size */}
          <div className="tool-group">
            <h3>BRUSH SIZE</h3>

            <div className="size-controls">
              <button onClick={decreaseBrush}>
                <FaMinus />
              </button>

              <div className="size-value">
                <strong>{brushSize}</strong>
                <span>px</span>
              </div>

              <button onClick={increaseBrush}>
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
                setBrushSize(Number(event.target.value))
              }
            />
          </div>
        </aside>

        {/* Canvas Section */}
        <section className="canvas-section">
          <div className="canvas-header">
            <div>
              <h2>Your Canvas</h2>
              <p>Express your creativity freely</p>
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

      {/* Footer */}
      <footer>
        <p>
          Built with <span>React</span> + <span>Vite</span>
        </p>

        <p>Draw • Create • Inspire</p>
      </footer>
    </div>
  );
}

export default App;