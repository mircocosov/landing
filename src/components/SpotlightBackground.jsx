import { useCallback, useEffect, useRef } from "react";
import styles from "./SpotlightBackground.module.scss";

const DEFAULT_RADIUS = 180;
const DEFAULT_FADE = 80;

const setCssVars = (node, { x, y, radius, fade }) => {
  if (!node) return;
  node.style.setProperty("--mx", `${x}px`);
  node.style.setProperty("--my", `${y}px`);
  node.style.setProperty("--r", `${radius}px`);
  node.style.setProperty("--fade", `${fade}px`);
};

const SpotlightBackground = ({
  imageUrl,
  radius = DEFAULT_RADIUS,
  fade = DEFAULT_FADE,
  className = "",
  children,
}) => {
  const wrapRef = useRef(null);
  const rafIdRef = useRef(0);
  const latestPointRef = useRef({ x: -9999, y: -9999 });

  const applyPosition = useCallback(() => {
    rafIdRef.current = 0;
    const node = wrapRef.current;
    if (!node) return;
    const { x, y } = latestPointRef.current;
    setCssVars(node, { x, y, radius, fade });
  }, [radius, fade]);

  const scheduleUpdate = useCallback(() => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(applyPosition);
  }, [applyPosition]);

  const handlePointerMove = useCallback((event) => {
    const node = wrapRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    latestPointRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    scheduleUpdate();
  }, [scheduleUpdate]);

  const handlePointerLeave = useCallback(() => {
    latestPointRef.current = { x: -9999, y: -9999 };
    scheduleUpdate();
  }, [scheduleUpdate]);

  useEffect(() => () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    latestPointRef.current = { x: centerX, y: centerY };
    setCssVars(node, { x: centerX, y: centerY, radius, fade });
  }, [radius, fade]);

  return (
    <div
      className={`${styles.wrap} ${className}`.trim()}
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        "--bg-url": `url(${imageUrl})`,
        "--r": `${radius}px`,
        "--fade": `${fade}px`,
      }}
    >
      <div className={styles.milk} />
      <div className={styles.photo} />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default SpotlightBackground;
