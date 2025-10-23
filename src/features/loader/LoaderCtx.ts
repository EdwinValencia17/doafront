import { createContext } from "react";
import type { Ctx } from "./types";

// Solo el contexto. Este archivo NO exporta componentes.
export const LoaderCtx = createContext<Ctx | null>(null);
