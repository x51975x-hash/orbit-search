import { useState } from 'react';

interface DragHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

interface Point { x: number; y: number }

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
}: DragHandlers) {
  const [startPos, setStartPos] = useState<Point | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent): Point => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const onStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setStartPos(getCoordinates(e));
    setOffset({ x: 0, y: 0 });
  };

  const onMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !startPos) return;
    const cur = getCoordinates(e);
    setOffset({ x: cur.x - startPos.x, y: cur.y - startPos.y });
  };

  const onEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setStartPos(null);

    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (absX > absY && absX > threshold) {
      if (offset.x > 0 && onSwipeRight) onSwipeRight();
      else if (offset.x < 0 && onSwipeLeft) onSwipeLeft();
    } else if (absY > absX && absY > threshold) {
      if (offset.y > 0 && onSwipeDown) onSwipeDown();
      else if (offset.y < 0 && onSwipeUp) onSwipeUp();
    }

    setOffset({ x: 0, y: 0 });
  };

  return {
    handlers: {
      onTouchStart: onStart,
      onTouchMove:  onMove,
      onTouchEnd:   onEnd,
      onMouseDown:  onStart,
      onMouseMove:  onMove,
      onMouseUp:    onEnd,
      onMouseLeave: onEnd,
    },
    offset,
    isDragging,
  };
}
