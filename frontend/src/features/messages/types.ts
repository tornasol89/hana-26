export interface MessageAutor {
  _id: string;
  nombre: string;
  apellido: string;
  foto?: string | null;
  tipo: "clienta" | "trabajadora" | "admin";
}

export interface Message {
  _id: string;
  reserva: string;
  autor: MessageAutor;
  texto: string;
  leidoPor?: string[];
  createdAt: string;
  updatedAt: string;
}