import React, { useEffect, useRef } from 'react';

/**
 * Ultra-Premium 3D Continuous Interactive Cybernetic & Neural Particle Canvas
 * Features:
 * - True 3D wireframe rotating globe / icosahedron at center
 * - Continuous 3D floating constellation with depth projection
 * - Glowing laser pulses and dynamic neural synapse lines
 * - Fixed background positioning (smooth 60fps across the entire hero & scroll)
 * - Interactive mouse parallax rotation
 */
export default function Background3DAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D Scene Parameters
    const FOV = 450;
    const PARTICLE_COUNT = 85;
    const MAX_CONNECT_DIST = 150;

    // Camera rotation angles
    let angleY = 0;
    let angleX = 0.15;
    let targetAngleY = 0;
    let targetAngleX = 0.15;

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / width) * 2 - 1;
      const mouseY = (e.clientY / height) * 2 - 1;
      targetAngleY = mouseX * 0.4;
      targetAngleX = mouseY * 0.25;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 1. Constellation Particles
    const particles = [];
    const colors = [
      { r: 56, g: 189, b: 248 },  // Electric Cyan
      { r: 168, g: 85, b: 247 },  // Neon Violet
      { r: 99, g: 102, b: 241 },  // Vibrant Indigo
      { r: 236, g: 72, b: 153 },  // Radiant Pink
      { r: 16, g: 185, b: 129 },  // Emerald
      { r: 245, g: 158, b: 11 },  // Golden Amber
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const rad = 200 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particles.push({
        x: rad * Math.cos(theta) * Math.cos(phi),
        y: rad * Math.sin(phi) * 0.85,
        z: rad * Math.sin(theta) * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // 2. Central 3D Rotating Geometric Wireframe Sphere/Polyhedron
    const sphereVertices = [];
    const sphereRadius = 180;
    const rings = 8;
    const slices = 12;

    for (let r = 0; r <= rings; r++) {
      const v = (r / rings) * Math.PI;
      for (let s = 0; s < slices; s++) {
        const u = (s / slices) * Math.PI * 2;
        sphereVertices.push({
          x: sphereRadius * Math.sin(v) * Math.cos(u),
          y: sphereRadius * Math.cos(v) * 0.9,
          z: sphereRadius * Math.sin(v) * Math.sin(u),
          ring: r,
          slice: s,
        });
      }
    }

    let time = 0;

    // Render Loop
    const render = () => {
      time += 0.016;

      // Smooth camera interpolation with continuous auto rotation
      angleY += (targetAngleY - angleY) * 0.04 + 0.0022;
      angleX += (targetAngleX - angleX) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const centerY = height * 0.42; // Center behind Hero text

      // A. Draw Central 3D Wireframe Globe
      const projectedGlobe = [];
      for (let i = 0; i < sphereVertices.length; i++) {
        const v = sphereVertices[i];

        // Rotate globe slightly opposite to create dual depth
        const globeAngleY = angleY * 1.2 + time * 0.15;
        const gCosY = Math.cos(globeAngleY);
        const gSinY = Math.sin(globeAngleY);

        const x1 = v.x * gCosY - v.z * gSinY;
        const z1 = v.z * gCosY + v.x * gSinY;

        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;

        const camZ = z2 + 620;
        if (camZ > 50) {
          const scale = FOV / camZ;
          projectedGlobe.push({
            x: x1 * scale + width / 2,
            y: y2 * scale + centerY,
            z: camZ,
            ring: v.ring,
            slice: v.slice,
          });
        }
      }

      // Connect globe wireframe lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedGlobe.length; i++) {
        const p1 = projectedGlobe[i];
        for (let j = i + 1; j < projectedGlobe.length; j++) {
          const p2 = projectedGlobe[j];
          // Connect adjacent in same ring or same slice
          if (
            (p1.ring === p2.ring && Math.abs(p1.slice - p2.slice) === 1) ||
            (p1.slice === p2.slice && Math.abs(p1.ring - p2.ring) === 1)
          ) {
            const alpha = Math.max(0.04, Math.min(0.22, (800 - p1.z) / 900));
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // B. Project & Draw 3D Constellation Particles
      const projected = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulse += p.pulseSpeed;

        if (p.x > 650) p.x = -650;
        if (p.x < -650) p.x = 650;
        if (p.y > 450) p.y = -450;
        if (p.y < -450) p.y = 450;
        if (p.z > 650) p.z = -650;
        if (p.z < -650) p.z = 650;

        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const camZ = z2 + 650;
        if (camZ > 50) {
          const scale = FOV / camZ;
          const projX = x1 * scale + width / 2;
          const projY = y2 * scale + centerY;

          const depthAlpha = Math.max(0.2, Math.min(1, (1000 - camZ) / 750));
          const currentRadius = p.radius * scale * (1 + 0.35 * Math.sin(p.pulse));

          projected.push({
            x: projX,
            y: projY,
            z: camZ,
            scale,
            alpha: depthAlpha,
            radius: currentRadius,
            color: p.color,
          });
        }
      }

      // Sort depth
      projected.sort((a, b) => b.z - a.z);

      // Draw connection lines
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = MAX_CONNECT_DIST * ((p1.scale + p2.scale) / 2);
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.42 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = Math.max(0.7, 1.6 * p1.scale);
            ctx.stroke();
          }
        }
      }

      // Draw Glowing Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const { r, g, b } = p.color;

        // Outer Glow Halo
        const glowRad = Math.max(3, p.radius * 4.5);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRad);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.9 * p.alpha})`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${0.45 * p.alpha})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRad, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.2, p.radius * 0.9), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 3D Hardware Accelerated Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Floating 3D Concentric Cybernetic Rings with Ambient Glow */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] sm:w-[820px] sm:h-[820px] pointer-events-none select-none opacity-60">
        {/* Outer Cyan Dashed Ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin"
          style={{ animationDuration: '40s' }}
        />
        {/* Middle Violet Rotating Ring */}
        <div
          className="absolute inset-[60px] rounded-full border border-purple-500/35 animate-spin"
          style={{ animationDuration: '28s', animationDirection: 'reverse' }}
        />
        {/* Inner Pulsing Radar Ring */}
        <div
          className="absolute inset-[130px] rounded-full border-2 border-indigo-400/40 animate-pulse"
          style={{ animationDuration: '3.5s' }}
        />
        {/* Center Radiant Core Lighting */}
        <div className="absolute inset-[190px] rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/25 to-cyan-500/20 blur-3xl" />
      </div>

      {/* 3D Perspective Cybernetic Laser Grid Floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[480px] bg-[linear-gradient(to_right,#6366f122_1px,transparent_1px),linear-gradient(to_bottom,#6366f122_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_100%,#000_75%,transparent_100%)]"
        style={{
          transform: 'perspective(550px) rotateX(68deg) scale(1.8)',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}
