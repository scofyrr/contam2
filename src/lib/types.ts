// src/lib/types.ts
export type ContamRol = "ADMIN" | "CONTADOR" | "OPERADOR";

export type ContamSession = {
  userId?: string;
  email?: string;
  nombre?: string;
  rol?: ContamRol;
};
