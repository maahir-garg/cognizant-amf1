"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PARTNER_NAME } from "@/lib/config";

export function PartnerHero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section ref={ref} className="relative -mx-4 min-h-[78svh] overflow-hidden border-b border-line sm:-mx-6">
      <motion.div className="absolute inset-0" style={reducedMotion ? undefined : { y: imageY }}>
        <Image
          src="/brand/amr26-launch-quarter.jpg"
          alt="Aston Martin Aramco race car in the team launch studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] opacity-65"
        />
      </motion.div>
      <div className="absolute inset-0 bg-bg/35" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-bg via-bg/75 to-transparent" />

      <motion.div
        style={reducedMotion ? undefined : { y: copyY }}
        className="relative z-10 flex min-h-[78svh] max-w-5xl flex-col justify-end gap-5 px-4 py-12 sm:px-6 sm:py-16 lg:px-12"
      >
        <p className="label text-ink-2">{PARTNER_NAME} × Aston Martin Aramco</p>
        <h1 className="display max-w-4xl text-[clamp(3.4rem,9vw,8.8rem)]">Impact intelligence</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
          AI turns published sustainability evidence into a view that partners can inspect, question and use. Every figure keeps
          its status and source.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="#evidence">Follow the evidence</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/partners/narratives">See AI at work</Link>
          </Button>
        </div>
      </motion.div>

      <div className="absolute right-4 bottom-5 z-10 hidden items-center gap-3 sm:flex">
        <span className="h-px w-12 bg-line-strong" />
        <span className="label text-ink-2">Scroll to inspect</span>
      </div>
    </section>
  );
}
