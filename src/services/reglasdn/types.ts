export type Aprobador = { tipo: string; nivel: string };

export type Regla = {
  id: string;
  reglaNegocio: string;
  centroCosto: string;
  compania: string;
  montoMax: number;
  aprobadores: Aprobador[];
  vigente: boolean;
  updatedAt: string;
  __min?: number;
  categoria?: string;
  ccNivel?: string;
};

export type CentroDTO = { centroCosto: string; compania: string };
export type CategoriaDTO = { id: number; categoria: string; descripcion?: string };
