"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useIntersection(options?: IntersectionObserverInit) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [element, setElement] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const optionsRef = useRef(options);

  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!element) {
      queueMicrotask(() => setEntry(null));
      return;
    }
    const observer = new IntersectionObserver(([first]) => {
      setEntry(first ?? null);
    }, optionsRef.current);
    observer.observe(element);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [element]);

  return { ref, entry } as const;
}
