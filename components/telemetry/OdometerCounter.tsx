"use client";

import React, { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const OdometerCounter: React.FC<CounterProps> = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { damping: 25, stiffness: 120 });
  const [displayStr, setDisplayStr] = useState<string>(
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))
  );

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      setDisplayStr(
        decimals > 0
          ? latest.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : Math.round(latest).toLocaleString("en-US")
      );
    });
    return () => unsubscribe();
  }, [springVal, decimals]);

  return (
    <span className={`tabular-nums font-mono font-black ${className}`}>
      {prefix}
      <span>{displayStr}</span>
      {suffix && <span className="ml-1 text-xs font-normal text-amf1-silver">{suffix}</span>}
    </span>
  );
};
