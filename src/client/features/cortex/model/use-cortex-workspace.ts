"use client";

import { useCallback, useState } from "react";
import { INITIAL_FLAGS } from "@/data/demo/cortex";
import type { CortexScreen, GliaFlag, NavStyle } from "./types";

export function useCortexWorkspace() {
  const [screen, setScreen] = useState<CortexScreen>("pipeline");
  const [listening, setListening] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [flags, setFlags] = useState<GliaFlag[]>(INITIAL_FLAGS);

  const navStyle = useCallback(
    (key: CortexScreen): NavStyle => {
      const active = screen === key;
      return {
        bg: active ? "rgba(255,255,255,0.07)" : "transparent",
        bar: active ? "#0E9C89" : "transparent",
        col: active ? "#FFFFFF" : "#909BAA",
      };
    },
    [screen]
  );

  const resolveFlag = useCallback((id: string) => {
    setFlags((current) => current.filter((flag) => flag.id !== id));
  }, []);

  const toggleListening = useCallback(() => {
    setListening((current) => !current);
  }, []);

  return {
    screen,
    navigate: setScreen,
    listening,
    toggleListening,
    explainOpen,
    openExplanation: () => setExplainOpen(true),
    closeExplanation: () => setExplainOpen(false),
    flags,
    resolveFlag,
    navStyle,
  };
}
