"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

interface GlobeLoaderProps {
  label?: string;
  className?: string;
  showBackground?: boolean;
  style?: React.CSSProperties;
}

export function GlobeLoader({
  label = "Loading",
  className = "",
  showBackground = true,
  style = {},
}: GlobeLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [worldData, setWorldData] = useState<{ land: any; borders: any } | null>(null);

  // Fetch world atlas data on mount
  useEffect(() => {
    let active = true;
    fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
      .then((r) => r.json())
      .then((world) => {
        if (!active) return;
        const land = topojson.feature(world, world.objects.countries);
        const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
        setWorldData({ land, borders });
      })
      .catch((err) => {
        console.error("Failed to load world atlas data for GlobeLoader:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  // Run animation loop once data is loaded and canvas is ready
  useEffect(() => {
    if (!worldData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = 2;
    const SIZE = 200;

    // Reset scaling and scale coordinate system to support retina displays
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);

    const INK = "#1a1a1a";
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = 78;

    const projection = d3.geoOrthographic()
      .scale(R)
      .translate([cx, cy])
      .clipAngle(90);

    const path = d3.geoPath(projection, ctx);
    const graticule = d3.geoGraticule10();

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceQuery.matches;

    const handleReduceChange = (e: MediaQueryListEvent) => {
      reduce = e.matches;
    };
    reduceQuery.addEventListener("change", handleReduceChange);

    let animationFrameId: number;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // sphere disc — subtle fill to read as a globe
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#e7e3da";
      ctx.fill();

      // graticule lines
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = INK;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // land fill
      ctx.beginPath();
      path(worldData!.land);
      ctx.fillStyle = INK;
      ctx.fill();

      // country borders carved out lighter
      ctx.beginPath();
      path(worldData!.borders);
      ctx.strokeStyle = "#f4f2ed";
      ctx.lineWidth = 0.4;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // crisp sphere outline
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function frame(t: number) {
      const rot = reduce ? -20 : (t / 1000) * 22; // deg/sec
      projection.rotate([rot, -12, 0]);
      draw();
      if (!reduce) {
        animationFrameId = requestAnimationFrame(frame);
      }
    }

    // Initial frame
    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      reduceQuery.removeEventListener("change", handleReduceChange);
    };
  }, [worldData]);

  // Styling properties matching the user's snippet
  const containerStyle: React.CSSProperties = showBackground
    ? {
        position: "fixed",
        inset: 0,
        background: "#f4f2ed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        ...style,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      };

  return (
    <div style={containerStyle} className={className}>
      <div
        className="loader"
        role="img"
        aria-label={label}
        style={{
          position: "relative",
          width: 200,
          height: 200,
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          style={{
            position: "absolute",
            inset: 0,
            width: 200,
            height: 200,
          }}
        />
        <svg
          className="whirl animate-whirl-spin"
          viewBox="0 0 200 200"
          width="200"
          height="200"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {/* orbiting dashed arc */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 10 22 120"
            opacity="0.55"
          />
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="1 14 40 110"
            opacity="0.3"
          />
        </svg>
      </div>
      {label && (
        <div
          style={{
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#1a1a1a",
            fontFamily: "var(--font-sans, sans-serif)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {label}
        </div>
      )}
      <style jsx global>{`
        @keyframes whirl-spin {
          to { transform: rotate(360deg); }
        }
        .animate-whirl-spin {
          animation: whirl-spin 3.2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-whirl-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}
