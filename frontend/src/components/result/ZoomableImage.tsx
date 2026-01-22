import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const getBounds = (newScale = scale) => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imageWidth = image.clientWidth * newScale;
    const imageHeight = image.clientHeight * newScale;

    const maxX = Math.max(0, (imageWidth - containerWidth) / 2);
    const maxY = Math.max(0, (imageHeight - containerHeight) / 2);

    return {
      minX: -maxX,
      maxX,
      minY: -maxY,
      maxY,
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setScale((prev) => {
        const next = prev + (e.deltaY < 0 ? 0.1 : -0.1);
        const clamped = clamp(next, 1, 3);

        const bounds = getBounds(clamped);
        setPosition((pos) => ({
          x: clamp(pos.x, bounds.minX, bounds.maxX),
          y: clamp(pos.y, bounds.minY, bounds.maxY),
        }));

        return clamped;
      });
    };

    container.addEventListener("wheel", wheelHandler, { passive: false });
    return () => container.removeEventListener("wheel", wheelHandler);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setPosition((prev) => {
      const bounds = getBounds();
      return {
        x: clamp(prev.x + dx, bounds.minX, bounds.maxX),
        y: clamp(prev.y + dy, bounds.minY, bounds.maxY),
      };
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-[750px] h-[560px] overflow-hidden rounded-lg shadow-lg bg-black flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      <div
        ref={imageRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: dragging.current ? 'none' : 'transform 0.1s ease-out',
        }}
        className="origin-center"
      >
        <Image
          src={src}
          alt={alt}
          width={750}
          height={560}
          priority
          unoptimized
          loading="eager"
          className="object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ZoomableImage;
