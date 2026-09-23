"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { STATIONS } from "@/lib/constants";
import { PersonaKey } from "@/lib/types";

const DRAG_THRESHOLD = 5; // Pixels threshold to distinguish click vs drag
const MIN_USER_ZOOM = 0.6;
const MAX_USER_ZOOM = 2.0;

interface UseCameraViewportOptions {
  activePersona: PersonaKey | null;
}

export function useCameraViewport({ activePersona }: UseCameraViewportOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [userZoom, setUserZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  const pinchStartRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    midX: number;
    midY: number;
  } | null>(null);

  const totalDragDistRef = useRef<number>(0);

  // Update viewport dimensions on mount & window resize
  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setDimensions({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Reset user pan offset when active persona changes, but keep userZoom
  useEffect(() => {
    setUserPan({ x: 0, y: 0 });
  }, [activePersona]);

  // Base camera target from STATIONS constants
  const cameraTarget = activePersona ? STATIONS[activePersona] : STATIONS.home;
  const baseScale = cameraTarget.scale;
  const totalScale = baseScale * userZoom;

  // Center translation calculation
  const camX = (cameraTarget.x / 100) * dimensions.width;
  const camY = (cameraTarget.y / 100) * dimensions.height;

  // Free pan (unclamped so island can travel across cosmic background)
  const finalTranslateX = dimensions.width / 2 - camX * totalScale + userPan.x;
  const finalTranslateY = dimensions.height / 2 - camY * totalScale + userPan.y;

  // Keep state refs updated for non-passive wheel event handler
  const stateRef = useRef({
    userZoom,
    userPan,
    dimensions,
    camX,
    camY,
    baseScale,
    finalTranslateX,
    finalTranslateY,
  });

  useEffect(() => {
    stateRef.current = {
      userZoom,
      userPan,
      dimensions,
      camX,
      camY,
      baseScale,
      finalTranslateX,
      finalTranslateY,
    };
  }, [userZoom, userPan, dimensions, camX, camY, baseScale, finalTranslateX, finalTranslateY]);

  // Mouse wheel scroll-to-zoom (Cursor-anchored)
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = stateRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      const newZoom = Math.max(MIN_USER_ZOOM, Math.min(MAX_USER_ZOOM, state.userZoom * zoomFactor));

      if (newZoom === state.userZoom) return;

      const rect = element.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const scaleRatio = newZoom / state.userZoom;
      const newBaseTransX = state.dimensions.width / 2 - state.camX * state.baseScale * newZoom;
      const newBaseTransY = state.dimensions.height / 2 - state.camY * state.baseScale * newZoom;

      const newPanX = cursorX - scaleRatio * (cursorX - state.finalTranslateX) - newBaseTransX;
      const newPanY = cursorY - scaleRatio * (cursorY - state.finalTranslateY) - newBaseTransY;

      setUserZoom(newZoom);
      setUserPan({ x: newPanX, y: newPanY });
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  // Drag Handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    totalDragDistRef.current = 0;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialPanX: userPan.x,
      initialPanY: userPan.y,
    };
  };

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.startX;
    const dy = clientY - dragStartRef.current.startY;
    totalDragDistRef.current = Math.hypot(dx, dy);

    setUserPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  }, []);

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    pinchStartRef.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => handleDragEnd();

  // Multi-touch drag & pinch-zoom handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && viewportRef.current) {
      setIsDragging(false);
      dragStartRef.current = null;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const rect = viewportRef.current.getBoundingClientRect();
      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      pinchStartRef.current = {
        initialDist: dist,
        initialZoom: userZoom,
        initialPan: { ...userPan },
        midX,
        midY,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && pinchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const { initialDist, initialZoom, midX, midY } = pinchStartRef.current;

      const zoomFactor = currentDist / initialDist;
      const newZoom = Math.max(MIN_USER_ZOOM, Math.min(MAX_USER_ZOOM, initialZoom * zoomFactor));

      const state = stateRef.current;
      const scaleRatio = newZoom / state.userZoom;
      const newBaseTransX = state.dimensions.width / 2 - state.camX * state.baseScale * newZoom;
      const newBaseTransY = state.dimensions.height / 2 - state.camY * state.baseScale * newZoom;

      const newPanX = midX - scaleRatio * (midX - state.finalTranslateX) - newBaseTransX;
      const newPanY = midY - scaleRatio * (midY - state.finalTranslateY) - newBaseTransY;

      setUserZoom(newZoom);
      setUserPan({ x: newPanX, y: newPanY });
    }
  };

  const onTouchEnd = () => handleDragEnd();

  const isDragExceeded = () => totalDragDistRef.current > DRAG_THRESHOLD;

  return {
    viewportRef,
    isDragging,
    totalScale,
    finalTranslateX,
    finalTranslateY,
    isDragExceeded,
    userZoom,
    eventHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
