// packages/vco-cord/src/features/identity/IdentityContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { initializeIdentity, uint8ArrayToHex, hexToUint8Array } from "../../lib/vco.js";
import type { Identity } from "../../types/index.js";

const PRIV_KEY = "vco_simulator_identity_priv";
const NAME_KEY = "vco_simulator_identity_name";

interface IdentityCtx {
  identity: Identity | null;
  regenerate: () => void;
  updateName: (name: string) => void;
}

const Ctx = createContext<IdentityCtx | undefined>(undefined);

const NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve", "Faythe", "Grace"];

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    const savedPriv = localStorage.getItem(PRIV_KEY);
    const savedName = localStorage.getItem(NAME_KEY);
    
    if (savedPriv && savedName) {
      setIdentity(initializeIdentity(savedName, hexToUint8Array(savedPriv)));
    } else {
      regenerate();
    }
  }, []);

  const regenerate = () => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)]!;
    const newId = initializeIdentity(name);
    setIdentity(newId);
    localStorage.setItem(PRIV_KEY, uint8ArrayToHex(newId.privateKey));
    localStorage.setItem(NAME_KEY, newId.displayName);
  };

  const updateName = (name: string) => {
    if (!identity) return;
    const updated = { ...identity, displayName: name };
    setIdentity(updated);
    localStorage.setItem(NAME_KEY, name);
  };

  return <Ctx.Provider value={{ identity, regenerate, updateName }}>{children}</Ctx.Provider>;
}

export function useIdentity(): IdentityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity requires IdentityProvider");
  return ctx;
}
