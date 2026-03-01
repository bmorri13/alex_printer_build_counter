import { useEffect, useRef, useCallback, useState } from 'react';

interface UseScrollFramesConfig {
  /** Path prefix for frames (e.g., '/frames/frame-') */
  framePath: string;
  /** File extension including dot (e.g., '.jpg') */
  frameExtension?: string;
  /** Total number of frames */
  totalFrames: number;
  /** Zero-padding digits for filenames (default: 4) */
  paddingDigits?: number;
  /** Frames to load eagerly on mount (default: 10) */
  eagerLoadCount?: number;
  /** Frames per idle-load batch (default: 5) */
  idleChunkSize?: number;
  /** Play frames in reverse order (default: false) */
  reverse?: boolean;
}

interface UseScrollFramesReturn {
  /** Attach to the <canvas> element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Attach to the scroll section wrapper */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** Loading progress 0-1 */
  loadProgress: number;
  /** Current frame index */
  currentFrame: number;
}

export function useScrollFrames(config: UseScrollFramesConfig): UseScrollFramesReturn {
  const {
    framePath,
    frameExtension = '.jpg',
    totalFrames,
    paddingDigits = 4,
    eagerLoadCount = 10,
    idleChunkSize = 5,
    reverse = false,
  } = config;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(totalFrames).fill(null));
  const currentFrameRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lastDrawnRef = useRef(-1);
  const loadedCountRef = useRef(0);

  const [loadProgress, setLoadProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  const getFrameSrc = useCallback(
    (index: number) => {
      const num = String(index + 1).padStart(paddingDigits, '0');
      return `${framePath}${num}${frameExtension}`;
    },
    [framePath, frameExtension, paddingDigits]
  );

  const loadFrame = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (framesRef.current[index]) {
          resolve(framesRef.current[index]!);
          return;
        }
        const img = new Image();
        img.onload = () => {
          framesRef.current[index] = img;
          loadedCountRef.current++;
          setLoadProgress(loadedCountRef.current / totalFrames);
          resolve(img);
        };
        img.onerror = reject;
        img.src = getFrameSrc(index);
      });
    },
    [getFrameSrc, totalFrames]
  );

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = containerW / containerH;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    // "contain" mode — fit entire image within viewport
    if (containerRatio > imgRatio) {
      drawH = containerH;
      drawW = containerH * imgRatio;
      drawX = (containerW - drawW) / 2;
      drawY = 0;
    } else {
      drawW = containerW;
      drawH = containerW / imgRatio;
      drawX = 0;
      drawY = (containerH - drawH) / 2;
    }

    ctx.clearRect(0, 0, containerW, containerH);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    if (!container) return;

    const displayW = container.clientWidth;
    const displayH = container.clientHeight;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = -rect.top;
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, sectionTop / sectionHeight));
      const rawFrame = Math.round(progress * (totalFrames - 1));
      const frame = reverse ? (totalFrames - 1 - rawFrame) : rawFrame;
      currentFrameRef.current = frame;
      setCurrentFrame(frame);
    };

    const renderLoop = () => {
      if (currentFrameRef.current !== lastDrawnRef.current) {
        drawFrame(currentFrameRef.current);
        lastDrawnRef.current = currentFrameRef.current;
      }
      if (isAnimatingRef.current) {
        requestAnimationFrame(renderLoop);
      }
    };

    const startAnimation = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      requestAnimationFrame(renderLoop);
    };

    const stopAnimation = () => {
      isAnimatingRef.current = false;
    };

    const idlePreload = () => {
      let next = eagerLoadCount;
      const loadChunk = (deadline?: IdleDeadline) => {
        let loaded = 0;
        while (
          next < totalFrames &&
          loaded < idleChunkSize &&
          (!deadline || deadline.timeRemaining() > 5)
        ) {
          loadFrame(next);
          next++;
          loaded++;
        }
        if (next < totalFrames) {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(loadChunk);
          } else {
            setTimeout(() => loadChunk(), 50);
          }
        }
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadChunk);
      } else {
        setTimeout(() => loadChunk(), 100);
      }
    };

    resizeCanvas();

    const setup = async () => {
      const count = Math.min(eagerLoadCount, totalFrames);
      const eagerPromises = Array.from({ length: count }, (_, i) => loadFrame(i));
      // When reversed, also eagerly load the last frame so it's ready for initial draw
      if (reverse) eagerPromises.push(loadFrame(totalFrames - 1));
      await Promise.all(eagerPromises);

      const firstFrame = reverse ? totalFrames - 1 : 0;
      currentFrameRef.current = firstFrame;
      resizeCanvas();
      drawFrame(firstFrame);

      if (prefersReduced) return;

      idlePreload();
    };

    setup();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
          startAnimation();
        } else {
          window.removeEventListener('scroll', onScroll);
          stopAnimation();
        }
      },
      { threshold: 0, rootMargin: '100px' }
    );
    observer.observe(section);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      stopAnimation();
      clearTimeout(resizeTimer);
    };
  }, [totalFrames, eagerLoadCount, idleChunkSize, reverse, drawFrame, loadFrame, resizeCanvas]);

  return { canvasRef, sectionRef, loadProgress, currentFrame };
}
