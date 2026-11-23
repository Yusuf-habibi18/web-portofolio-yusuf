import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import depthUrl from '../assets/portrait-depth.png';

/**
 * The hero portrait as a real 3D relief you can turn.
 *
 * An AI depth map (Depth Anything V2, baked to `portrait-depth.png`: R/B = 16-bit depth,
 * G = soft silhouette) displaces a dense grid; the photo is the texture. Plain WebGL 1,
 * no 3D library, so it stays small and is only loaded once the hero is on screen.
 *
 * - Follows the pointer (laptop) or the auto-sway / gyroscope (phones) via `sx`/`sy`.
 * - Drag (mouse or finger) to rotate it further; it eases back when released.
 * - At rest it lines up pixel-for-pixel with the flat <img>, so the swap is invisible.
 */

type Props = {
  /** The already-loaded portrait <img> (its currentSrc is reused as the texture). */
  img: HTMLImageElement;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  /** Rose focus marker, moved so it stays locked on the rose while the model turns. */
  focus?: HTMLElement | null;
  onReady: () => void;
  onFail: () => void;
};

// How far the canvas reaches past the photo's box, so the turning model is never clipped.
const EX = 0.2; // each side, fraction of the photo width
const EY_TOP = 0.05; // above, fraction of the photo height
const DEPTH = 0.36; // world units of relief (photo height = 2)
const DIST = 4.6; // camera distance: mild perspective
const ROSE: [number, number] = [0.459, 0.323];
const MAX_DRAG = 16; // degrees of extra turn from dragging
const MAX_YAW = 18; // total turn: beyond this a single photo starts to smear
const deg = Math.PI / 180;

const VERT = `
attribute vec3 aPos;
attribute vec2 aUv;
attribute vec3 aNor;
uniform mat4 uMvp;
uniform mat3 uRot;
varying vec2 vUv;
varying vec3 vNor;
void main() {
  vUv = aUv;
  vNor = uRot * aNor;
  gl_Position = uMvp * vec4(aPos, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uCol;
uniform sampler2D uDep;
uniform vec3 uLight;
uniform float uPass;                             // 0: solid body (writes depth), 1: fringe + halo
varying vec2 vUv;
varying vec3 vNor;
void main() {
  vec4 c = texture2D(uCol, vUv);               // premultiplied
  if (uPass < 0.5) { if (c.a < 0.5) discard; } else { if (c.a >= 0.5) discard; }
  float sil = texture2D(uDep, vUv).g;            // soft silhouette
  vec3 n = normalize(vNor);
  float diff = max(dot(n, uLight), 0.0);
  float shade = 0.9 + 0.16 * diff;               // gentle, keeps skin tones
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
  vec3 signal = vec3(0.459, 0.655, 1.0);
  vec3 royal = vec3(0.141, 0.341, 1.0);
  float edge = c.a * (1.0 - c.a) * 3.0;          // thin lit edge on the cut-out fringe
  vec3 rgb = c.rgb * shade + signal * (rim * 0.22 * c.a + edge * 0.5);
  float halo = sil * (1.0 - c.a) * 0.2;          // soft blue halo just outside the figure
  rgb += royal * halo;
  float a = c.a + halo;
  if (a < 0.004) discard;
  gl_FragColor = vec4(rgb, a);
}`;

type Mat4 = Float32Array;
const mul = (a: Mat4, b: Mat4): Mat4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
};
const translate = (x: number, y: number, z: number): Mat4 =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const rotY = (t: number): Mat4 => {
  const c = Math.cos(t), s = Math.sin(t);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};
const rotX = (t: number): Mat4 => {
  const c = Math.cos(t), s = Math.sin(t);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};
const frustum = (l: number, r: number, b: number, t: number, n: number, f: number): Mat4 =>
  new Float32Array([
    (2 * n) / (r - l), 0, 0, 0,
    0, (2 * n) / (t - b), 0, 0,
    (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1,
    0, 0, (-2 * f * n) / (f - n), 0,
  ]);
const apply = (m: Mat4, v: [number, number, number]) => {
  const [x, y, z] = v;
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w] as const;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export default function Portrait3D({ img, sx, sy, focus, onReady, onFail }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onReady, onFail, focus });
  cb.current = { onReady, onFail, focus };

  useEffect(() => {
    const cv = canvas.current!;
    const box = wrap.current!;
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl) {
      cb.current.onFail();
      return;
    }
    let disposed = false;
    let raf = 0;
    let visible = true;

    // drag state
    let drag = 0, dragV = 0, dragging = false, lastX = 0, moved = 0;
    let dragP = 0;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      return s;
    };

    const setup = async () => {
      const [col, dep] = await Promise.all([loadImage(img.currentSrc || img.src), loadImage(depthUrl)]);
      if (disposed) return;

      // read depth on the CPU to build the mesh
      const W = dep.naturalWidth, H = dep.naturalHeight;
      const c2 = document.createElement('canvas');
      c2.width = W;
      c2.height = H;
      const ctx = c2.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(dep, 0, 0);
      const px = ctx.getImageData(0, 0, W, H).data;
      const depthAt = (x: number, y: number) => {
        const i = (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4;
        return (px[i] * 256 + px[i + 2]) / 65535;
      };

      const aspect = col.naturalWidth / col.naturalHeight;
      const hw = aspect; // half width (photo height = 2)
      const STEP = 2;
      const NX = Math.floor((W - 1) / STEP) + 1, NY = Math.floor((H - 1) / STEP) + 1;
      const pos = new Float32Array(NX * NY * 3), uv = new Float32Array(NX * NY * 2), nor = new Float32Array(NX * NY * 3);
      const zAt = (gx: number, gy: number) => (depthAt(gx * STEP, gy * STEP) - 0.5) * DEPTH;
      for (let gy = 0; gy < NY; gy++)
        for (let gx = 0; gx < NX; gx++) {
          const k = gy * NX + gx;
          const u = (gx * STEP) / (W - 1), v = (gy * STEP) / (H - 1);
          pos.set([(u * 2 - 1) * hw, 1 - v * 2, zAt(gx, gy)], k * 3);
          uv.set([u, v], k * 2);
          const dx = zAt(Math.min(NX - 1, gx + 1), gy) - zAt(Math.max(0, gx - 1), gy);
          const dy = zAt(gx, Math.min(NY - 1, gy + 1)) - zAt(gx, Math.max(0, gy - 1));
          const sxw = ((2 * STEP) / (W - 1)) * 2 * hw, syw = ((2 * STEP) / (H - 1)) * 2;
          const nx = -dx / sxw, ny = dy / syw, len = Math.hypot(nx, ny, 1);
          nor.set([nx / len, ny / len, 1 / len], k * 3);
        }
      const idx = new Uint16Array((NX - 1) * (NY - 1) * 6);
      let p = 0;
      for (let gy = 0; gy < NY - 1; gy++)
        for (let gx = 0; gx < NX - 1; gx++) {
          const a = gy * NX + gx, b = a + 1, c = a + NX, d = c + 1;
          idx.set([a, c, b, b, c, d], p);
          p += 6;
        }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(prog);

      const buf = (data: ArrayBufferView, name: string, size: number) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      };
      buf(pos, 'aPos', 3);
      buf(uv, 'aUv', 2);
      buf(nor, 'aNor', 3);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

      const tex = (image: HTMLImageElement, unit: number, premul: boolean, name: string) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premul);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(prog, name), unit);
      };
      tex(col, 0, true, 'uCol');
      tex(dep, 1, false, 'uDep');

      const uMvp = gl.getUniformLocation(prog, 'uMvp');
      const uRot = gl.getUniformLocation(prog, 'uRot');
      const uLight = gl.getUniformLocation(prog, 'uLight');
      const uPass = gl.getUniformLocation(prog, 'uPass');
      const L = [0.45, 0.35, 0.82];
      const ll = Math.hypot(...L);
      gl.uniform3f(uLight, L[0] / ll, L[1] / ll, L[2] / ll);

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      // pivot: middle of the figure's depth; pitch hinges at the bottom edge
      const zPivot = (depthAt(Math.round(W * 0.5), Math.round(H * 0.45)) - 0.5) * DEPTH;
      const roseZ = (depthAt(Math.round(ROSE[0] * (W - 1)), Math.round(ROSE[1] * (H - 1))) - 0.5) * DEPTH;
      const fine = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
      const yawGain = fine ? 28 : 16;
      const pitchGain = 7;

      let first = true;
      let last = performance.now();
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // size (CSS px of the canvas box -> backing store)
        const dpr = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.75);
        const cw = box.clientWidth, ch = box.clientHeight;
        if (!cw || !ch) return;
        const bw = Math.round(cw * dpr), bh = Math.round(ch * dpr);
        if (cv.width !== bw || cv.height !== bh) {
          cv.width = bw;
          cv.height = bh;
        }
        gl.viewport(0, 0, bw, bh);

        // release: spring the drag back to 0
        if (!dragging) {
          dragV += (-drag * 22 - dragV * 7) * dt;
          drag += dragV * dt;
          dragP += (0 - dragP) * Math.min(1, dt * 4);
        }

        const yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, sx.get() * yawGain + drag)) * deg;
        const pitch = (sy.get() * pitchGain + dragP) * deg;

        // the photo box sits inside the canvas box: canvas = photo widened by EX each side, EY_TOP above
        const fw = 2 * hw, fh = 2;
        const left = -hw - EX * fw, right = hw + EX * fw, top = 1 + EY_TOP * fh;
        const bottom = top - (right - left) * (ch / cw); // keep pixels square
        const near = 0.5, far = 20;
        const proj = frustum((left * near) / DIST, (right * near) / DIST, (bottom * near) / DIST, (top * near) / DIST, near, far);
        const view = translate(0, 0, -DIST);
        const model = mul(
          translate(0, -1, 0),
          mul(rotX(pitch), mul(translate(0, 1, zPivot), mul(rotY(yaw), translate(0, 0, -zPivot)))),
        );
        const mvp = mul(proj, mul(view, model));
        gl.uniformMatrix4fv(uMvp, false, mvp);
        gl.uniformMatrix3fv(
          uRot,
          false,
          new Float32Array([model[0], model[1], model[2], model[4], model[5], model[6], model[8], model[9], model[10]]),
        );
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // solid body first (writes depth), then the soft fringe/halo on top without writing depth,
        // so the transparent halo can never punch holes in the body when it turns
        gl.depthMask(true);
        gl.uniform1f(uPass, 0);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        gl.depthMask(false);
        gl.uniform1f(uPass, 1);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        gl.depthMask(true);

        // keep the rose focus marker on the rose (position in % of the photo box)
        const f = cb.current.focus;
        if (f) {
          const [nx, ny] = apply(mvp, [(ROSE[0] * 2 - 1) * hw, 1 - ROSE[1] * 2, roseZ]);
          const cxp = ((nx + 1) / 2) * cw, cyp = ((1 - ny) / 2) * ch;
          const photoW = cw / (1 + 2 * EX), photoH = ch - (EY_TOP * fh * ch) / (top - bottom) - 0; // photo box height in px
          const ox = EX * photoW, oy = (EY_TOP * fh * ch) / (top - bottom);
          f.style.left = `${((cxp - ox) / photoW) * 100}%`;
          f.style.top = `${((cyp - oy) / photoH) * 100}%`;
        }

        if (first) {
          first = false;
          cb.current.onReady();
        }
      };
      raf = requestAnimationFrame(frame);
    };

    setup().catch(() => !disposed && cb.current.onFail());

    // drag to rotate (horizontal; vertical swipes still scroll the page on phones)
    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      box.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      const over = Math.max(0, Math.abs(drag) - MAX_DRAG * 0.7) / (MAX_DRAG * 0.3); // rubber band near the limit
      drag = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, drag + dx * 0.18 * (1 - Math.min(0.85, over))));
      dragV = 0;
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      if (box.hasPointerCapture(e.pointerId)) box.releasePointerCapture(e.pointerId);
    };
    // a drag shouldn't also count as a click (which replays the scan line)
    const click = (e: MouseEvent) => {
      if (moved > 6) e.stopPropagation();
    };
    box.addEventListener('pointerdown', down);
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    box.addEventListener('click', click, true);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(box);
    const vis = () => (visible = !document.hidden);
    document.addEventListener('visibilitychange', vis);
    const lost = (e: Event) => {
      e.preventDefault();
      cb.current.onFail();
    };
    cv.addEventListener('webglcontextlost', lost);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      cv.removeEventListener('webglcontextlost', lost);
      box.removeEventListener('pointerdown', down);
      box.removeEventListener('pointermove', move);
      box.removeEventListener('pointerup', up);
      box.removeEventListener('pointercancel', up);
      box.removeEventListener('click', click, true);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [img, sx, sy]);

  return (
    <div
      ref={wrap}
      className="absolute bottom-0 cursor-grab touch-pan-y select-none active:cursor-grabbing max-lg:[mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
      style={{ left: `${-EX * 100}%`, right: `${-EX * 100}%`, top: `${-EY_TOP * 100}%` }}
      data-cursor="Drag"
    >
      <canvas ref={canvas} className="block size-full" aria-hidden />
    </div>
  );
}
