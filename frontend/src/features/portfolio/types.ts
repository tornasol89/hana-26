export interface PortfolioRespaldadaPor {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
  verificada?: boolean;
}

export interface PortfolioReserva {
  _id: string;
  servicio: string;
  clienta?: {
    _id: string;
    nombre: string;
    apellido: string;
    foto?: string | null;
    verificada?: boolean;
  };
}

export interface PortfolioTrabajadora {
  _id: string;
  usuario?: {
    _id: string;
    nombre: string;
    apellido: string;
    foto?: string | null;
  };
}

export interface PortfolioItem {
  _id: string;
  trabajadora: string | PortfolioTrabajadora;
  titulo: string;
  descripcion?: string;
  fotoUrl: string;
  reserva?: PortfolioReserva | null;
  respaldada: boolean;
  respaldadaPor?: PortfolioRespaldadaPor | null;
  fechaRespaldo?: string | null;
  createdAt: string;
}

export interface CreatePortfolioPayload {
  titulo: string;
  descripcion?: string;
  foto: File;
  reservaId?: string;
}
