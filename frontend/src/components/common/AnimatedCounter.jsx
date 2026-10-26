import React, { useState, useEffect } from 'react';

/**
 * AnimatedCounter component
 * Smoothly animates numbers counting up from 0 to the target value
 * with an easeOutCubic curve.
 */
export default function AnimatedCounter({
  target = 0,
  duration = 1400,
  prefix = '',
  suffix = '',
  decimals = 0,
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = parseFloat(target) || 0;
    if (end === 0) {
      setCurrent(0);
      return;
    }

    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo / easeOutCubic curve for smooth slowing down at the end
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = ease * end;

      setCurrent(decimals > 0 ? parseFloat(val.toFixed(decimals)) : Math.round(val));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCurrent(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, decimals]);

  return (
    <span>
      {prefix}
      {current}
      {suffix}
    </span>
  );
}
