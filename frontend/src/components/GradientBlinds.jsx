import { useEffect, useRef } from "react";
import * as OGL from "ogl";
import "./GradientBlinds.css";

const MAX_COLORS = 8;
const hexToRGB = (hex) => {
  const c = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
};
const prepStops = (stops) => {
  const base = (stops && stops.length ? stops : ["#FF9FFC", "#5227FF"]).slice(
    0,
    MAX_COLORS,
  );
  if (base.length === 1) base.push(base[0]);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[i]));
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
  return { arr, count };
};

const GradientBlinds = ({
  className,
  dpr,
  paused = false,
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  mouseDampening = 0.15,
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten",
}) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const programRef = useRef(null);
  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const rendererRef = useRef(null);
  const fallbackRef = useRef(null);
  const mouseTargetRef = useRef([0, 0]);
  const lastTimeRef = useRef(0);
  const firstResizeRef = useRef(true);
  const prevClientXRef = useRef(null);
  const prevClientYRef = useRef(null);
  const targetUniformsRef = useRef({
    distort: distortAmount,
    shine: 0,
    spotRadius: spotlightRadius,
    spotOpacity: spotlightOpacity,
  });
  const currentUniformsRef = useRef({
    distort: distortAmount,
    shine: 0,
    spotRadius: spotlightRadius,
    spotOpacity: spotlightOpacity,
  });
  const fallbackTargetRef = useRef({ x: 0.5, y: 0.5 });
  const fallbackCurrentRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (
      typeof window === "undefined" ||
      typeof window.WebGL2RenderingContext === "undefined"
    )
      return;

    let renderer;
    try {
      renderer = new OGL.Renderer({
        dpr:
          dpr ??
          (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
        alpha: true,
        antialias: true,
      });
      rendererRef.current = renderer;
    } catch (e) {
      // WebGL init failed — render CSS fallback
      const fallback = document.createElement("div");
      fallback.className = "gradient-blinds-fallback";
      // set CSS vars for gradient colors
      const stops = prepStops(gradientColors).arr;
      fallback.style.setProperty(
        "--g0",
        `rgb(${Math.round(stops[0][0] * 255)}, ${Math.round(stops[0][1] * 255)}, ${Math.round(stops[0][2] * 255)})`,
      );
      fallback.style.setProperty(
        "--g1",
        `rgb(${Math.round(stops[1][0] * 255)}, ${Math.round(stops[1][1] * 255)}, ${Math.round(stops[1][2] * 255)})`,
      );
      container.appendChild(fallback);
      return () => {
        try {
          container.removeChild(fallback);
        } catch {}
      };
    }
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const vertex = `attribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = vec4(position, 0.0, 1.0);\n}`;

    const fragment = `#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec3  iResolution;\nuniform vec2  iMouse;\nuniform float iTime;\n\nuniform float uAngle;\nuniform float uNoise;\nuniform float uBlindCount;\nuniform float uSpotlightRadius;\nuniform float uSpotlightSoftness;\nuniform float uSpotlightOpacity;\nuniform float uMirror;\nuniform float uDistort;\nuniform float uShineFlip;\nuniform vec3  uColor0;\nuniform vec3  uColor1;\nuniform vec3  uColor2;\nuniform vec3  uColor3;\nuniform vec3  uColor4;\nuniform vec3  uColor5;\nuniform vec3  uColor6;\nuniform vec3  uColor7;\nuniform int   uColorCount;\n\nvarying vec2 vUv;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvec2 rotate2D(vec2 p, float a){\n  float c = cos(a);\n  float s = sin(a);\n  return mat2(c, -s, s, c) * p;\n}\n\nvec3 getGradientColor(float t){\n  float tt = clamp(t, 0.0, 1.0);\n  int count = uColorCount;\n  if (count < 2) count = 2;\n  float scaled = tt * float(count - 1);\n  float seg = floor(scaled);\n  float f = fract(scaled);\n\n  if (seg < 1.0) return mix(uColor0, uColor1, f);\n  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);\n  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);\n  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);\n  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);\n  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);\n  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);\n  if (count > 7) return uColor7;\n  if (count > 6) return uColor6;\n  if (count > 5) return uColor5;\n  if (count > 4) return uColor4;\n  if (count > 3) return uColor3;\n  if (count > 2) return uColor2;\n  return uColor1;\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv0 = fragCoord.xy / iResolution.xy;\n\n    float aspect = iResolution.x / iResolution.y;\n    vec2 p = uv0 * 2.0 - 1.0;\n    p.x *= aspect;\n    vec2 pr = rotate2D(p, uAngle);\n    pr.x /= aspect;\n    vec2 uv = pr * 0.5 + 0.5;\n\n    vec2 uvMod = uv;\n    if (uDistort > 0.0) {\n      float a = uvMod.y * 6.0;\n      float b = uvMod.x * 6.0;\n      float w = 0.01 * uDistort;\n      uvMod.x += sin(a) * w;\n      uvMod.y += cos(b) * w;\n    }\n    float t = uvMod.x;\n    if (uMirror > 0.5) {\n      t = 1.0 - abs(1.0 - 2.0 * fract(t));\n    }\n    vec3 base = getGradientColor(t);\n\n    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);\n  float d = length(uv0 - offset);\n  float r = max(uSpotlightRadius, 1e-4);\n  float dn = d / r;\n  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;\n  vec3 cir = vec3(spot);\n  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));\n  if (uShineFlip > 0.5) stripe = 1.0 - stripe;\n    vec3 ran = vec3(stripe);\n\n    vec3 col = cir + base - ran;\n    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;\n\n    fragColor = vec4(col, 1.0);\n}\n\nvoid main() {\n    vec4 color;\n    mainImage(color, vUv * iResolution.xy);\n    gl_FragColor = color;\n}\n`;

    const { arr: colorArr, count: colorCount } = prepStops(gradientColors);
    const uniforms = {
      iResolution: {
        value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1],
      },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uAngle: { value: (angle * Math.PI) / 180 },
      uNoise: { value: noise },
      uBlindCount: { value: Math.max(1, blindCount) },
      uSpotlightRadius: { value: spotlightRadius },
      uSpotlightSoftness: { value: spotlightSoftness },
      uSpotlightOpacity: { value: spotlightOpacity },
      uMirror: { value: mirrorGradient ? 1 : 0 },
      uDistort: { value: distortAmount },
      uShineFlip: { value: shineDirection === "right" ? 1 : 0 },
      uColor0: { value: colorArr[0] },
      uColor1: { value: colorArr[1] },
      uColor2: { value: colorArr[2] },
      uColor3: { value: colorArr[3] },
      uColor4: { value: colorArr[4] },
      uColor5: { value: colorArr[5] },
      uColor6: { value: colorArr[6] },
      uColor7: { value: colorArr[7] },
      uColorCount: { value: colorCount },
    };

    let program;
    try {
      program = new OGL.Program(gl, { vertex, fragment, uniforms });
    } catch (err) {
      // fallback to CSS gradient
      const fallback = document.createElement("div");
      fallback.className = "gradient-blinds-fallback";
      const stops = prepStops(gradientColors).arr;
      fallback.style.setProperty(
        "--g0",
        `rgb(${Math.round(stops[0][0] * 255)}, ${Math.round(stops[0][1] * 255)}, ${Math.round(stops[0][2] * 255)})`,
      );
      fallback.style.setProperty(
        "--g1",
        `rgb(${Math.round(stops[1][0] * 255)}, ${Math.round(stops[1][1] * 255)}, ${Math.round(stops[1][2] * 255)})`,
      );
      container.appendChild(fallback);
      return () => {
        try {
          container.removeChild(fallback);
        } catch {}
      };
    }
    programRef.current = program;

    let geometry;
    if (typeof OGL.Triangle === "function") {
      try {
        geometry = new OGL.Triangle(gl);
      } catch (e) {
        geometry = null;
      }
    }
    if (!geometry) {
      geometry = new OGL.Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });
    }
    geometryRef.current = geometry;
    const mesh = new OGL.Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    // verify UV attribute exists and is usable; if not, fall back to CSS
    const hasUV = (() => {
      try {
        if (!geometry) return false;
        if (geometry.attributes) {
          if (typeof geometry.attributes.get === "function") {
            return !!geometry.attributes.get("uv");
          }
          return !!geometry.attributes.uv;
        }
        return false;
      } catch (e) {
        return false;
      }
    })();
    if (!hasUV) {
      // cleanup GL canvas
      if (canvas.parentElement === container) container.removeChild(canvas);
      try {
        rendererRef.current &&
          rendererRef.current.destroy &&
          rendererRef.current.destroy();
      } catch {}
      // attach CSS fallback
      const fallback = document.createElement("div");
      fallback.className = "gradient-blinds-fallback";
      const stops = prepStops(gradientColors).arr;
      fallback.style.setProperty(
        "--g0",
        `rgb(${Math.round(stops[0][0] * 255)}, ${Math.round(stops[0][1] * 255)}, ${Math.round(stops[0][2] * 255)})`,
      );
      fallback.style.setProperty(
        "--g1",
        `rgb(${Math.round(stops[1][0] * 255)}, ${Math.round(stops[1][1] * 255)}, ${Math.round(stops[1][2] * 255)})`,
      );
      container.appendChild(fallback);
      // short-circuit and ensure we don't start RAF/render loop
      return () => {
        try {
          container.removeChild(fallback);
        } catch {}
      };
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.iResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        1,
      ];

      if (blindMinWidth && blindMinWidth > 0) {
        const maxByMinWidth = Math.max(
          1,
          Math.floor(rect.width / blindMinWidth),
        );
        const effective = blindCount
          ? Math.min(blindCount, maxByMinWidth)
          : maxByMinWidth;
        uniforms.uBlindCount.value = Math.max(1, effective);
      } else {
        uniforms.uBlindCount.value = Math.max(1, blindCount);
      }

      if (firstResizeRef.current) {
        firstResizeRef.current = false;
        const cx = gl.drawingBufferWidth / 2;
        const cy = gl.drawingBufferHeight / 2;
        uniforms.iMouse.value = [cx, cy];
        mouseTargetRef.current = [cx, cy];
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onPointerMove = (e) => {
      const rect = canvas
        ? canvas.getBoundingClientRect()
        : container.getBoundingClientRect();
      const scale = renderer && renderer.dpr ? renderer.dpr : 1;
      const clientX = e.clientX;
      const clientY = e.clientY;
      const x = (clientX - rect.left) * scale;
      const y = (rect.height - (clientY - rect.top)) * scale;
      mouseTargetRef.current = [x, y];
      if (mouseDampening <= 0) uniforms.iMouse.value = [x, y];

      // calculate normalized positions [0..1]
      const normX = (clientX - rect.left) / rect.width;
      const normY = (clientY - rect.top) / rect.height;

      // compute delta to influence shine/flip
      const prevX = prevClientXRef.current;
      const dx = prevX == null ? 0 : clientX - prevX;
      prevClientXRef.current = clientX;
      prevClientYRef.current = clientY;

      // Update target values (we'll lerp toward them in the RAF loop)
      try {
        const dynDistort =
          Math.abs(normX - 0.5) * 1.2 + Math.min(1, Math.abs(dx) / 200);
        targetUniformsRef.current.distort = distortAmount + dynDistort * 0.5;
        targetUniformsRef.current.shine = dx > 0 ? 1 : 0;
        targetUniformsRef.current.spotRadius = Math.max(
          0.1,
          spotlightRadius * (1.0 - Math.abs(normY - 0.5)),
        );
        targetUniformsRef.current.spotOpacity = 1.0;
      } catch (err) {}

      // Update CSS fallback targets
      try {
        fallbackTargetRef.current.x = Math.max(0, Math.min(1, normX));
        fallbackTargetRef.current.y = Math.max(0, Math.min(1, normY));
      } catch (e) {}
    };
    // Attach pointer listener to canvas (when present) and container as fallback
    if (canvas) canvas.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointermove", onPointerMove);

    const loop = (t) => {
      rafRef.current = requestAnimationFrame(loop);
      uniforms.iTime.value = t * 0.001;
      let dt = 0;
      if (mouseDampening > 0) {
        if (!lastTimeRef.current) lastTimeRef.current = t;
        dt = (t - lastTimeRef.current) / 1000;
        lastTimeRef.current = t;
        const tau = Math.max(1e-4, mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        // smooth iMouse
        const target = mouseTargetRef.current;
        const cur = uniforms.iMouse.value;
        cur[0] += (target[0] - cur[0]) * factor;
        cur[1] += (target[1] - cur[1]) * factor;

        // smooth other uniforms toward targets
        const curU = currentUniformsRef.current;
        const tgtU = targetUniformsRef.current;
        curU.distort +=
          (tgtU.distort - curU.distort) * Math.min(1, factor * 1.8);
        curU.spotRadius +=
          (tgtU.spotRadius - curU.spotRadius) * Math.min(1, factor * 1.8);
        curU.spotOpacity +=
          (tgtU.spotOpacity - curU.spotOpacity) * Math.min(1, factor * 1.8);
        // set uniforms
        try {
          uniforms.uDistort.value = curU.distort;
          uniforms.uSpotlightRadius.value = curU.spotRadius;
          uniforms.uSpotlightOpacity.value = curU.spotOpacity;
          // shine flip discrete threshold
          uniforms.uShineFlip.value = tgtU.shine > 0.5 ? 1 : 0;
        } catch (e) {}

        // smooth CSS fallback
        const fCur = fallbackCurrentRef.current;
        const fTgt = fallbackTargetRef.current;
        fCur.x += (fTgt.x - fCur.x) * Math.min(1, factor * 2.5);
        fCur.y += (fTgt.y - fCur.y) * Math.min(1, factor * 2.5);
        try {
          const fb =
            fallbackRef.current ||
            container.querySelector(".gradient-blinds-fallback");
          if (fb) {
            fb.style.setProperty("--bg-pos-x", `${Math.round(fCur.x * 100)}%`);
            fb.style.setProperty("--bg-pos-y", `${Math.round(fCur.y * 100)}%`);
            fb.style.transform = `translate3d(${(fCur.x - 0.5) * 8}px, ${(fCur.y - 0.5) * 8}px, 0)`;
          }
        } catch (e) {}
      } else {
        lastTimeRef.current = t;
      }

      if (!paused && programRef.current && meshRef.current) {
        try {
          renderer.render({ scene: meshRef.current });
        } catch (e) {
          console.error(e);
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (canvas) canvas.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      if (canvas.parentElement === container) container.removeChild(canvas);
      const callIfFn = (obj, key) => {
        if (obj && typeof obj[key] === "function") obj[key].call(obj);
      };
      callIfFn(programRef.current, "remove");
      callIfFn(geometryRef.current, "remove");
      callIfFn(meshRef.current, "remove");
      callIfFn(rendererRef.current, "destroy");
      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
    };
  }, [
    dpr,
    paused,
    gradientColors,
    angle,
    noise,
    blindCount,
    blindMinWidth,
    mouseDampening,
    mirrorGradient,
    spotlightRadius,
    spotlightSoftness,
    spotlightOpacity,
    distortAmount,
    shineDirection,
  ]);

  return (
    <div
      ref={containerRef}
      className={`gradient-blinds-container ${className || ""}`}
      style={{ mixBlendMode }}
    />
  );
};

export default GradientBlinds;
