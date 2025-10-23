// Tipos compartidos (no hay componentes aquí)
export type Ctx = {
  show: () => void;
  hide: () => void;
  setProgress: (n?: number) => void;
  busy: boolean;
};
