import React, { useRef, useState, useCallback } from 'react';
import { playTickSound } from '../utils/audioEffects';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees of tilt, default 12
  glareOpacity?: number; // 0 to 1
  perspective?: number; // px, default 1000
  glowColor?: string; // default #FF5A43
  soundFeedback?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  id?: string;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glareOpacity = 0.22,
  perspective = 1000,
  glowColor = '#FF5A43',
  soundFeedback = false,
  onClick,
  id
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxTilt to +maxTilt)
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      // Glare coordinates in percentages
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTransformStyle(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlarePosition({ x: glareX, y: glareY, opacity: glareOpacity });
    },
    [maxTilt, glareOpacity]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (soundFeedback) {
      playTickSound(720);
    }
  }, [soundFeedback]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
    >
      <div
        id={id}
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: transformStyle,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease'
            : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease',
          boxShadow: isHovered
            ? `0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px -5px ${glowColor}40, inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 -1px 1px ${glowColor}25`
            : '0 10px 25px -10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.06)'
        }}
        className={`relative overflow-hidden transition-all select-none backdrop-blur-xl ${className}`}
      >
        {/* Specular Glare / Sheen Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.28), rgba(255, 90, 67, 0.12) 40%, transparent 80%)`,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Specular Rim Lighting border accent */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 border transition-opacity duration-300"
          style={{
            borderColor: isHovered ? `${glowColor}60` : 'transparent',
            boxShadow: isHovered ? `inset 0 0 15px ${glowColor}20` : 'none'
          }}
        />

        {/* Inner Content with 3D depth */}
        <div style={{ transform: 'translateZ(18px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
