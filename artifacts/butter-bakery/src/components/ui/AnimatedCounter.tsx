import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  className?: string;
  duration?: number;
}

function parse(raw: string) {
  const m = raw.match(/^([\d.]+)(.*)$/);
  return m ? { num: parseFloat(m[1]), suffix: m[2] } : { num: 0, suffix: raw };
}

export function AnimatedCounter({ value, className, duration = 1800 }: Props) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const { num, suffix } = parse(value);
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return;
        fired.current = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(eased * num) + suffix);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
