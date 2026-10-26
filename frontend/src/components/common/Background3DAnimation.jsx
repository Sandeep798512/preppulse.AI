import React, { useEffect, useRef } from 'react';

/**
 * High-Performance Continuous 3D Neural Mesh & Cybernetic Particle Canvas
 * Features:
 * - True 3D perspective projection (X, Y, Z coordinates with FOV)
 * - Continuous 3D rotation & orbital motion
 * - Interactive mouse camera parallax
 * - Interconnected neural synapse lines with depth-fading glow
 * - Zero external dependencies, pure 60fps hardware-accelerated Canvas
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

    // 3D Scene Config
    const FOV = 400;
    const PARTICLE_COUNT = 90;
    const MAX_DISTANCE = 140;

    // Camera angles
    let angleY = 0;
    let angleX = 0.2;
    let targetAngleY = 0;
    let targetAngleX = 0.2;

    // Mouse interaction
    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / width) * 2 - 1;
      const mouseY = (e.clientY / height) * 2 - 1;
      targetAngleY = mouseX * 0.45;
      targetAngleX = mouseY * 0.35;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Generate 3D Particles
    const particles = [];
    const colors = [
      'rgba(56, 189, 248, ',  // Sky/Cyan
      'rgba(168, 85, 247, ',  // Purple/Violet
      'rgba(99, 102, 241, ',  // Indigo
      'rgba(236, 72, 153, ',  // Pink
      'rgba(16, 185, 129, ',  // Emerald
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Position particles in a spherical / cylinder volume
      const radius = 250 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particles.push({
        x: radius * Math.cos(theta) * Math.cos(phi),
        y: radius * Math.sin(phi) + (Math.random() - 0.5) * 100,
        z: radius * Math.sin(theta) * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        baseRadius: Math.random() * 2.5 + 1.2,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    // 3D Render Loop
    const render = () => {
      time += 0.015;

      // Smooth camera interpolation towards mouse target
      angleY += (targetAngleY - angleY) * 0.05 + 0.0018; // auto continuous 3D rotation
      angleX += (targetAngleX - angleX) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected = [];

      // Project each particle to 2D screen coordinates
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate slight drift
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap boundaries
        if (p.x > 600) p.x = -600;
        if (p.x < -600) p.x = 600;
        if (p.y > 400) p.y = -400;
        if (p.y < -400) p.y = 400;
        if (p.z > 600) p.z = -600;
        if (p.z < -600) p.z = 600;

        // 3D Rotation around Y then X
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        // Camera distance offset
        const cameraZ = z2 + 650;

        if (cameraZ > 20) {
          const scale = FOV / cameraZ;
          const projX = x1 * scale + width / 2;
          const projY = y2 * scale + height / 2 - 40; // slight lift towards hero

          // Depth-based opacity & size
          const alphaFactor = Math.max(0.1, Math.min(1, (1000 - cameraZ) / 800));
          const currentRadius = p.baseRadius * scale * (1 + 0.3 * Math.sin(time * 3 + p.pulseOffset));

          projected.push({
            x: projX,
            y: projY,
            z: cameraZ,
            scale,
            alphaFactor,
            radius: currentRadius,
            colorPrefix: p.colorPrefix,
          });
        }
      }

      // Sort by depth (painters algorithm)
      projected.sort((a, b) => b.z - a.z);

      // Draw 3D Neural Synapse Connections between close particles
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DISTANCE * ((p1.scale + p2.scale) / 2)) {
            const lineAlpha = (1 - dist / (MAX_DISTANCE * ((p1.scale + p2.scale) / 2))) * 0.28 * Math.min(p1.alphaFactor, p2.alphaFactor);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
            ctx.lineWidth = Math.max(0.6, 1.4 * p1.scale);
            ctx.stroke();
          }
        }
      }

      // Draw Glowing Particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Outer glow
        const glowRadius = Math.max(2, p.radius * 3.5);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `${p.colorPrefix}${0.85 * p.alphaFactor})`);
        gradient.addColorStop(0.4, `${p.colorPrefix}${0.35 * p.alphaFactor})`);
        gradient.addColorStop(1, `${p.colorPrefix}0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core bright center
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius * 0.9), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * p.alphaFactor})`;
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* 3D Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75 sm:opacity-90 transition-opacity duration-1000"
      />

      {/* Futuristic 3D Cybernetic Floating Rings & Core */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[580px] h-[580px] sm:w-[780px] sm:h-[780px] pointer-events-none select-none opacity-40 -z-10">
        {/* Outer Ring */}
        <div
          className="absolute inset-0 rounded-full border border-dashed border-indigo-500/25 animate-spin"
          style={{ animationDuration: '45s' }}
        />
        {/* Middle Ring with Gradient */}
        <div
          className="absolute inset-[45px] rounded-full border border-cyan-400/20 animate-spin"
          style={{ animationDuration: '30s', animationDirection: 'reverse' }}
        />
        {/* Inner Pulsing Radar Ring */}
        <div
          className="absolute inset-[110px] rounded-full border border-purple-500/30 animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        {/* Central Ambient Glow */}
        <div className="absolute inset-[180px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-cyan-500/10 blur-2xl" />
      </div>

      {/* Cybernetic High-Tech Grid Floor with Perspective Tilt */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[450px] bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_100%,#000_70%,transparent_100%)]"
        style={{
          transform: 'perspective(600px) rotateX(65deg) scale(1.6)',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}
