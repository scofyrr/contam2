// CONTAM — gestor de sesión por cookie cifrada (TanStack useSession).
// Para desarrollo usa un secreto por defecto si SESSION_SECRET no está definido.
import { useSession } from "@tanstack/react-start/server";

export type ContamSession = {
  userId?: string;
  email?: string;
  nombre?: string;
  rol?: "ADMIN" | "CONTADOR" | "OPERADOR";
};

export function getContamSession() {
  const password =
    process.env.SESSION_SECRET ??
    "contam-dev-secret-change-me-please-32chars-min";
  return useSession<ContamSession>({
    password,
    name: "contam_session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, sameSite: "lax", secure: false, path: "/" },
  });
}
