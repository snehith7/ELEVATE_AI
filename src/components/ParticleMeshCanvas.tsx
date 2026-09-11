import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
}

interface ParticleMeshCanvasProps {
  className?: string;
  particleCount?: number;
  accentColor?: string;
}

export const ParticleMeshCanvas: React.FC<ParticleMeshCanvasProps> = ({
  className = 'absolute inset-0 pointer-events-none z-0',
  particleCount = 50,
  accentColor = '#FF5A43'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isInside: boolean }>({
    x: -9999,
    y: -9999,
    isInside: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isInside: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isInside = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize particles
    const colors = [accentColor, '#FFA07A', '#FFFFFF', '#FF3E24'];
    const particles: Particle[] = [];

    const effectiveCount = Math.min(particleCount, Math.floor((width * height) / 18000) + 25);

    for (let i = 0; i < effectiveCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.5 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDist = 120;
      const mouseMaxDist = 140;

      // Draw mesh connection filaments
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particles
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce off bounds
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse interaction: gentle repulsion / glow field
        if (mouseRef.current.isInside) {
          const dx = mouseRef.current.x - p1.x;
          const dy = mouseRef.current.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseMaxDist) {
            const force = (1 - dist / mouseMaxDist) * 0.8;
            p1.x -= (dx / dist) * force * 1.5;
            p1.y -= (dy / dist) * force * 1.5;

            // Draw line to mouse
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 90, 67, ${(1 - dist / mouseMaxDist) * 0.35})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.baseAlpha;
        ctx.shadowBlur = p1.radius > 1.8 ? 8 : 2;
        ctx.shadowColor = accentColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 120, 100, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ filter: 'drop-shadow(0 0 10px rgba(255,90,67,0.1))' }}
    />
  );
};
