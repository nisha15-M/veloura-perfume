import { useEffect, useRef } from "react";

export function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext("2d");
    let w, h, raf;
    const dots = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.4, s: Math.random() * 0.00006 + 0.00002, a: Math.random() * 0.5 + 0.15, p: Math.random() * 6 }));
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    size();
    addEventListener("resize", size);
    const draw = (t) => {
      x.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.y -= d.s * 16;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        x.beginPath();
        x.arc(d.x * w + Math.sin(t / 2000 + d.p) * 14, d.y * h, d.r, 0, 7);
        x.fillStyle = `rgba(240,207,142,${d.a * (0.6 + 0.4 * Math.sin(t / 900 + d.p))})`;
        x.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw(0);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) cancelAnimationFrame(raf);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="dust" aria-hidden="true" />;
}

let ctx, master, padTimer, chimeTimer, step = 0;
// Am9 -> Fmaj7 -> G -> Em : slow, warm, elegant
const CHORDS = [[220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392], [164.81, 196, 246.94, 329.63]];
const BELLS = [659.25, 783.99, 880, 987.77, 1174.66];

function playPad() {
  const t = ctx.currentTime;
  CHORDS[step++ % CHORDS.length].forEach((f) => {
    [-6, 6].forEach((d) => {
      const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = f / 2; o.detune.value = d;
      lp.type = "lowpass"; lp.frequency.value = 650;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 3);
      g.gain.linearRampToValueAtTime(0, t + 9);
      o.connect(lp); lp.connect(g); g.connect(master);
      o.start(t); o.stop(t + 9.5);
    });
  });
}

function playChime() {
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = BELLS[Math.floor(Math.random() * BELLS.length)];
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 3.6);
  chimeTimer = setTimeout(playChime, 2500 + Math.random() * 3500);
}

export function setAmbience(on) {
  if (on) {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(comp); comp.connect(ctx.destination);
    }
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.8);
    clearInterval(padTimer); clearTimeout(chimeTimer);
    playPad(); padTimer = setInterval(playPad, 6000);
    chimeTimer = setTimeout(playChime, 1500);
  } else if (ctx) {
    clearInterval(padTimer); clearTimeout(chimeTimer);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    setTimeout(() => ctx.suspend(), 900);
  }
}