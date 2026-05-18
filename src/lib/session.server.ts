// src/lib/session.server.ts
// CONTAM — gestor de sesión por cookie cifrada (TanStack useSession).
import { useSession } from "@tanstack/react-start/server";
import { ContamSession } from "./types"; // Importación limpia desde tipos independientes

export function getContamSession() {
  const password =
    process.env.SESSION_SECRET ??
    "contam-dev-secret-change-me-please-32chars-min";

  return useSession<ContamSession>({
    password,
    name: "contam_session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { 
      httpOnly: true, 
      sameSite: "lax", 
      secure: process.env.NODE_ENV === "production", // Cambiado a true en producción por seguridad
      path: "/" 
    },
  });
}
