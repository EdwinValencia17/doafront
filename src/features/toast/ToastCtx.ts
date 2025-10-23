import { createContext } from "react";
import type { ShowInput } from "./types";

export type ToastAPI = { show: (o: ShowInput) => void };

export const ToastCtx = createContext<ToastAPI | null>(null);
