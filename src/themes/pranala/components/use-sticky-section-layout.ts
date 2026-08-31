"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type StickyLayout = Record<string, { top: number; z: number }>;

const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

export function useStickySectionLayout(headerBlocks: any[] | null) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [stickyLayout, setStickyLayout] = useState<StickyLayout>({});

  useLayoutEffect(() => {
    if (!headerBlocks) {
      setStickyLayout({});
      return;
    }

    const sections = headerBlocks
      .filter((block) => block?.type === "section" && (block?.isActive ?? true))
      .sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));

    const stickyIds = sections
      .filter((section) => isTruthy(section?.config?.sticky))
      .map((section) => String(section.id));

    if (stickyIds.length === 0) {
      setStickyLayout({});
      return;
    }

    const compute = () => {
      let top = 0;
      let z = 60;
      const next: StickyLayout = {};

      for (const id of stickyIds) {
        const element = sectionRefs.current[id];
        if (!element) continue;

        const style = window.getComputedStyle(element);
        const marginTop = Number.parseFloat(style.marginTop || "0");
        const marginBottom = Number.parseFloat(style.marginBottom || "0");
        top += Number.isFinite(marginTop) ? marginTop : 0;
        next[id] = { top, z };
        top += element.getBoundingClientRect().height + (Number.isFinite(marginBottom) ? marginBottom : 0);
        z += 1;
      }

      setStickyLayout(next);
    };

    compute();

    const resizeObserver = new ResizeObserver(compute);
    for (const id of stickyIds) {
      const element = sectionRefs.current[id];
      if (element) resizeObserver.observe(element);
    }

    window.addEventListener("resize", compute);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [headerBlocks]);

  const registerSectionRef = useCallback(
    (sectionId: string) => (element: HTMLDivElement | null) => {
      sectionRefs.current[sectionId] = element;
    },
    []
  );

  return { stickyLayout, registerSectionRef };
}
