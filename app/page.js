"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// Corner registration tick (rose right-triangle), oriented via CSS transforms.
function Tick({ pos }) {
  return (
    <span className={`tick ${pos}`} aria-hidden="true">
      <svg viewBox="0 0 42 42" fill="none">
        <polygon
          points="1,1 41,1 1,41"
          fill="none"
          stroke="#f8a5a7"
          strokeWidth="1.4"
        />
      </svg>
    </span>
  );
}

export default function Home() {
  const [elevation, setElevation] = useState(null); // background image element
  const [familyFile, setFamilyFile] = useState(null); // raw File
  const [cutout, setCutout] = useState(null); // transparent PNG element
  const [elevationName, setElevationName] = useState("");
  const [familyName, setFamilyName] = useState("");

  const [scale, setScale] = useState(0.35); // family width as fraction of image
  const [pos, setPos] = useState({ x: 0.5, y: 0.72 }); // family center (fractions)
  const [flip, setFlip] = useState(false);
  const [shadow, setShadow] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const canvasRef = useRef(null);
  const drag = useRef({ active: false, dx: 0, dy: 0 });

  // ---- Uploads ----
  const onElevation = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setElevationName(file.name);
    const img = new window.Image();
    img.onload = () => setElevation(img);
    img.src = URL.createObjectURL(file);
  };

  const onFamily = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFamilyName(file.name);
    setFamilyFile(file);
    setCutout(null);
    setStatus('Photo ready. Tap "Remove background & place".');
  };

  // ---- Background removal (runs entirely in the browser) ----
  const removeBg = async () => {
    if (!familyFile) return;
    setProcessing(true);
    setStatus(
      "Removing background… the first run downloads the AI model (~80MB), so give it a moment."
    );
    try {
      const mod = await import("@imgly/background-removal");
            // The ESM build exports removeBackground as a named export (no default);
      // fall back to .default for the CommonJS interop case.
      const removeBackground = mod.removeBackground || mod.default;
      const blob = await removeBackground(familyFile);
      const img = new window.Image();
      img.onload = () => {
        setCutout(img);
        setStatus("Done. Drag your family to reposition, use the slider to resize.");
        setProcessing(false);
      };
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong: " + (err?.message || err));
      setProcessing(false);
    }
  };

  // ---- Drawing ----
  const draw = useCallback(
    (ctx, W, H) => {
      ctx.clearRect(0, 0, W, H);
      if (elevation) ctx.drawImage(elevation, 0, 0, W, H);
      if (cutout) {
        const cw = scale * W;
        const ch = cw * (cutout.naturalHeight / cutout.naturalWidth);
        const cx = pos.x * W;
        const cy = pos.y * H;

        if (shadow) {
          ctx.save();
          ctx.globalAlpha = 0.22;
          ctx.fillStyle = "#000";
          ctx.filter = "blur(6px)";
          ctx.beginPath();
          ctx.ellipse(cx, cy + ch / 2, cw * 0.34, ch * 0.045, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(cx, cy);
        if (flip) ctx.scale(-1, 1);
        ctx.drawImage(cutout, -cw / 2, -ch / 2, cw, ch);
        ctx.restore();
      }
    },
    [elevation, cutout, scale, pos, flip, shadow]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !elevation) return;
    const maxW = 1000;
    const W = Math.min(maxW, elevation.naturalWidth);
    const H = Math.round(W * (elevation.naturalHeight / elevation.naturalWidth));
    canvas.width = W;
    canvas.height = H;
    draw(canvas.getContext("2d"), W, H);
  }, [elevation, draw]);

  // ---- Drag to reposition ----
  const frac = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onPointerDown = (e) => {
    if (!cutout || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const f = frac(e);
    const W = canvas.width;
    const H = canvas.height;
    const cw = scale * W;
    const ch = cw * (cutout.naturalHeight / cutout.naturalWidth);
    const px = f.x * W;
    const py = f.y * H;
    const cx = pos.x * W;
    const cy = pos.y * H;
    const inside =
      px >= cx - cw / 2 && px <= cx + cw / 2 && py >= cy - ch / 2 && py <= cy + ch / 2;
    if (inside) {
      drag.current = { active: true, dx: f.x - pos.x, dy: f.y - pos.y };
      canvas.setPointerCapture(e.pointerId);
    }
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const f = frac(e);
    setPos({ x: clamp(f.x - drag.current.dx), y: clamp(f.y - drag.current.dy) });
  };
  const onPointerUp = () => {
    drag.current.active = false;
  };

  // ---- Export at full elevation resolution ----
  const download = () => {
    if (!elevation) return;
    const W = elevation.naturalWidth;
    const H = elevation.naturalHeight;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    draw(off.getContext("2d"), W, H);
    off.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-first-glimpse.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <>
      <main className="wrap">
        <header className="site-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo" src="/logo.png" alt="JSW One Homes" />
        </header>
        <div className="hairline" />

        {/* Hero */}
        <section className="hero">
          <div className="hero-copy">
            <h1 className="h1">
              See your family in the home you&apos;ve always{" "}
              <span className="accent">dreamed of.</span>
            </h1>
            <p className="lead">
              Add your home&apos;s elevation and a family photo. We&apos;ll place
              your family in front of your new home for your first glimpse, ready
              to frame and cherish.
            </p>
            <div className="grad-rule" />
          </div>
          <div className="hero-art">
            <span className="circle-orange" />
            <div className="photo-circle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero.jpg" alt="A family in front of their new home" />
            </div>
            <span className="circle-sand" />
          </div>
        </section>

        {/* Tool */}
        <section className="tool">
          <div className="panel">
            <div className="block">
              <p className="step">Step 1</p>
              <p className="step-title">Add the elevation image</p>
              <label className="file">
                <div className="drop">
                  <b>Choose elevation</b>
                  <br />
                  the picture of the home
                </div>
                <input type="file" accept="image/*" onChange={onElevation} />
              </label>
              {elevationName && <div className="thumb">✓ {elevationName}</div>}
            </div>

            <div className="block">
              <p className="step">Step 2</p>
              <p className="step-title">Add the family photo</p>
              <label className="file">
                <div className="drop">
                  <b>Choose family photo</b>
                  <br />
                  any background is fine
                </div>
                <input type="file" accept="image/*" onChange={onFamily} />
              </label>
              {familyName && <div className="thumb">✓ {familyName}</div>}
              <button
                className="btn"
                style={{ marginTop: 14 }}
                onClick={removeBg}
                disabled={!familyFile || processing}
              >
                {processing ? "Working…" : "Remove background & place"}
              </button>
            </div>

            <div className="block">
              <p className="step">Step 3</p>
              <p className="step-title">Position &amp; fine-tune</p>
              <div className="control">
                <label>
                  <span>Family size</span>
                  <span>{Math.round(scale * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  disabled={!cutout}
                />
              </div>
              <div className="toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={flip}
                    onChange={(e) => setFlip(e.target.checked)}
                    disabled={!cutout}
                  />
                  Flip horizontally
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={shadow}
                    onChange={(e) => setShadow(e.target.checked)}
                    disabled={!cutout}
                  />
                  Ground shadow
                </label>
              </div>
              <button
                className="btn"
                style={{ marginTop: 18 }}
                onClick={download}
                disabled={!elevation || !cutout}
              >
                Download image
              </button>
            </div>

            <div className="status">
              {status || "Start by adding both images."}
            </div>
          </div>

          {/* Framed preview + caption band */}
          <div className="stage-col">
            <div className="stage-frame">
              <Tick pos="tl" />
              <Tick pos="tr" />
              <Tick pos="bl" />
              <Tick pos="br" />
              {elevation ? (
                <canvas
                  ref={canvasRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
              ) : (
                <div className="placeholder">
                  Your composite preview will appear here once you add an
                  elevation image.
                </div>
              )}
            </div>
            <div className="caption-band">
              The first glimpse of your dream home, to frame and cherish
            </div>
            {cutout && (
              <p className="hint">
                Tip: drag the family directly on the image to move them.
              </p>
            )}
          </div>
        </section>
      </main>

      <p className="foot-line">A lifetime of dreams, finally taking shape.</p>
      <div className="orange-bar" />
    </>
  );
}
