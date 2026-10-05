import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ lastEvent, width, height }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  // Trigger particles when events change
  useEffect(() => {
    if (!lastEvent) return;

    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const eventX = lastEvent.x || rect.width / 2;
    const eventY = lastEvent.y || rect.height / 2;

    if (lastEvent.type === 'nuke') {
      // Create Nuke Mushroom Cloud & Shockwave
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: eventX,
          y: eventY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3 + 1), // Upward rise
          size: Math.random() * 14 + 6,
          color: Math.random() < 0.6 ? '#ff4500' : Math.random() < 0.8 ? '#ffcc00' : '#333',
          life: 1.0,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
      // Shockwave ring
      particles.push({
        type: 'shockwave',
        x: eventX,
        y: eventY,
        radius: 10,
        maxRadius: 180,
        life: 1.0,
        decay: 0.03,
        color: '#ff6600',
      });
    } else if (lastEvent.type === 'ufo') {
      // UFO Beam particles
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: eventX + (Math.random() * 40 - 20),
          y: eventY - 200 + Math.random() * 200,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 4 + 2,
          size: Math.random() * 6 + 2,
          color: '#00ffcc',
          life: 1.0,
          decay: 0.025,
        });
      }
    } else if (lastEvent.type === 'strike') {
      // Rocket Smoke Trail
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: eventX + (Math.random() * 30 - 15),
          y: eventY + (Math.random() * 30 - 15),
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 10 + 4,
          color: Math.random() < 0.5 ? '#ff3300' : '#888888',
          life: 1.0,
          decay: 0.03,
        });
      }
    } else if (lastEvent.type === 'mine' || lastEvent.type === 'capture' || lastEvent.type === 'friendly') {
      // Mine / Capture explosion sparks
      const isMine = lastEvent.type === 'mine';
      const colorList = isMine ? ['#ff0000', '#ffaa00', '#222'] : ['#00ccff', '#ffffff'];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 1;
        particles.push({
          x: eventX,
          y: eventY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 3,
          color: colorList[Math.floor(Math.random() * colorList.length)],
          life: 1.0,
          decay: Math.random() * 0.04 + 0.02,
        });
      }
    }
  }, [lastEvent]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.type === 'shockwave') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 6 * p.life;
          ctx.globalAlpha = p.life;
          ctx.stroke();
          ctx.restore();

          p.radius += (p.maxRadius - p.radius) * 0.15;
          p.life -= p.decay;
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();

          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;
        }

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
}
