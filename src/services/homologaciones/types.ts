export type EstadoRegistro = 'A' | 'I' | 'E';

export type Paged<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  raw?: unknown;
};

export interface Homologacion {
  id_itca: number;
  descripcion?: string | null;
  fecha_creacion?: string | null;
  oper_creador?: string | null;
  fecha_modificacion?: string | null;
  oper_modifica?: string | null;
  estado_registro: EstadoRegistro;

  // Item
  id_item: number;
  referencia: string;
  item_descripcion?: string;

  // Categoría
  id_cate: number;
  categoria: string;
  categoria_descripcion?: string;
  sites?: string | null;

  // extras
  fecha_creacion_formateada?: string;
  fecha_modificacion_formateada?: string;
}

export interface HomologacionCreatePayload {
  item_id_item: number | string;
  categoria_id_cate: number | string;
  descripcion?: string;
}

export interface HomologacionUpdatePayload {
  descripcion?: string;
  categoria_id_cate?: number | string;
}

export interface HomologacionEstadoPayload {
  estado: EstadoRegistro;
}

export interface ItemResumen {
  id_item: number | string;
  referencia: string;
  descripcion?: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  oper_creador?: string;
  oper_modifica?: string;
  estado_registro: EstadoRegistro;
  total_homologaciones?: number | string;
  homologaciones_activas?: number | string;
  homologaciones?: Array<{
    id_itca: number | string;
    estado_registro: EstadoRegistro;
    id_cate: number | string;
    categoria: string;
    categoria_descripcion?: string;
  }>;
}

export interface Categoria {
  id_cate: number | string;
  categoria: string;
  descripcion?: string;
  sites?: string | null;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  oper_creador?: string;
  oper_modifica?: string;
  estado_registro: EstadoRegistro;
  total_items_activos?: number | string;
  total_items?: number | string;
  items_activos?: number | string;
}

export interface CategoriaOption {
  value: number | string;
  label: string;
  descripcion?: string;
  sites?: string | null;
  total_items?: number | string;
  items_activos?: number | string;
}
