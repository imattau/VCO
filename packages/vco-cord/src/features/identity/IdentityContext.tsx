// packages/vco-cord/src/features/identity/IdentityContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { generateIdentity } from "../../lib/vco.js";
import type { Identity } from "../../types/index.js";

interface IdentityCtx {
  identity: Identity | null;
  regenerate: () => void;
}

const Ctx = createContext<IdentityCtx | undefined>(undefined);

const NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve", "Faythe", "Grace"];

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  const regenerate = () => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)]!;
    setIdentity(generateIdentity(name));
  };

  useEffect(() => { regenerate(); }, []);

  return <Ctx.Provider value={{ identity, regenerate }}>{children}</Ctx.Provider>;
}

export function useIdentity(): IdentityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity requires IdentityProvider");
  return ctx;
}
