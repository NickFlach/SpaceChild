import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

export function StarField3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Initialize stars
    const numStars = 800;
    const stars: Star[] = [];
    const maxDepth = 1000;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * maxDepth,
        prevZ: 0,
      });
    }
    starsRef.current = stars;

    // Animation settings
    const speed = 0.5;
    const starSize = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(10, 15, 28, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update center position on each frame
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      starsRef.current.forEach((star) => {
        // Store previous Z position
        star.prevZ = star.z;

        // Move star towards viewer
        star.z -= speed;

        // Reset star if it passes the viewer
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = maxDepth;
          star.prevZ = star.z;
        }

        // 3D to 2D projection
        const x = (star.x / star.z) * 300 + cx;
        const y = (star.y / star.z) * 300 + cy;
        const prevX = (star.x / star.prevZ) * 300 + cx;
        const prevY = (star.y / star.prevZ) * 300 + cy;

        // Calculate star properties based on depth
        const opacity = 1 - star.z / maxDepth;
        const size = (1 - star.z / maxDepth) * starSize;

        // Draw star trail
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.5})`;
        ctx.lineWidth = size;
        ctx.stroke();

        // Draw star
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Add glow effect for bright stars
        if (opacity > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${opacity * 0.3})`;
          ctx.fill();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ background: "radial-gradient(ellipse at center, #0a0f1c 0%, #000000 100%)" }}
    />
  );
}

// Alternative CSS-only version for better performance on lower-end devices
export function StarFieldCSS() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="stars-container">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              "--star-x": `${Math.random() * 100}%`,
              "--star-y": `${Math.random() * 100}%`,
              "--star-z": `${Math.random() * 2000}px`,
              "--star-speed": `${15 + Math.random() * 30}s`,
              "--star-delay": `${Math.random() * 20}s`,
              "--star-size": `${1 + Math.random() * 2}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <style>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .star {
          position: absolute;
          width: var(--star-size);
          height: var(--star-size);
          background: white;
          border-radius: 50%;
          left: var(--star-x);
          top: var(--star-y);
          transform: translateZ(var(--star-z));
          animation: 
            star-travel var(--star-speed) linear infinite,
            star-pulse 3s ease-in-out infinite;
          animation-delay: var(--star-delay);
          box-shadow: 
            0 0 4px rgba(255, 255, 255, 0.8),
            0 0 8px rgba(0, 212, 255, 0.4);
        }
        
        @keyframes star-travel {
          from {
            transform: translateZ(2000px);
          }
          to {
            transform: translateZ(-1000px);
          }
        }
        
        @keyframes star-pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}