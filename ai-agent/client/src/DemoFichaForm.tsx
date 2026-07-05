import { useMemo, useState } from "react";
import type { PageContext } from "./api";
import { scanFormFields } from "./composer-bridge";

type FichaState = {
  ruc: string;
  general: Record<string, string>;
  modificacionContribuyente: Record<string, string>;
  domicilioFiscal: Record<string, string>;
  personaNatural: Record<string, string>;
  empresa: Record<string, string>;
};

const EMPTY: FichaState = {
  ruc: "20100070970",
  general: {},
  modificacionContribuyente: {},
  domicilioFiscal: {},
  personaNatural: {},
  empresa: {},
};

type FieldDef = { path: string; label: string; section: keyof FichaState | "ruc"; type?: string };

const DEMO_FIELDS: FieldDef[] = [
  { path: "ruc", label: "RUC", section: "ruc" },
  { path: "general.razonSocial", label: "Razón Social", section: "general" },
  { path: "general.tipoContribuyente", label: "Tipo Contribuyente", section: "general" },
  { path: "general.fechaInscripcion", label: "Fecha Inscripción", section: "general", type: "date" },
  { path: "general.fechaInicioActividades", label: "Fecha Inicio Actividades", section: "general", type: "date" },
  { path: "general.estadoContribuyente", label: "Estado Contribuyente", section: "general" },
  { path: "general.dependenciaSunat", label: "Dependencia SUNAT", section: "general" },
  { path: "general.condicionDomicilioFiscal", label: "Condición Domicilio Fiscal", section: "general" },
  { path: "modificacionContribuyente.nombreComercial", label: "Nombre Comercial", section: "modificacionContribuyente" },
  { path: "modificacionContribuyente.actividadEconomicaPrincipal", label: "Actividad Económica Principal", section: "modificacionContribuyente" },
  { path: "modificacionContribuyente.telefonoFijo1", label: "Teléfono Fijo 1", section: "modificacionContribuyente" },
  { path: "modificacionContribuyente.telefonoMovil1", label: "Teléfono Móvil 1", section: "modificacionContribuyente" },
  { path: "modificacionContribuyente.correoElectronico1", label: "Correo 1", section: "modificacionContribuyente" },
  { path: "domicilioFiscal.departamento", label: "Departamento", section: "domicilioFiscal" },
  { path: "domicilioFiscal.provincia", label: "Provincia", section: "domicilioFiscal" },
  { path: "domicilioFiscal.distrito", label: "Distrito", section: "domicilioFiscal" },
  { path: "domicilioFiscal.tipoNombreVia", label: "Tipo y Nombre de Vía", section: "domicilioFiscal" },
  { path: "personaNatural.documentoIdentidad", label: "Documento Identidad", section: "personaNatural" },
  { path: "empresa.numeroPartidaRegistral", label: "Número Partida Registral", section: "empresa" },
];

function getValue(state: FichaState, path: string): string {
  if (path === "ruc") return state.ruc;
  const [section, key] = path.split(".") as [keyof FichaState, string];
  const block = state[section];
  if (typeof block === "object" && block) return block[key] ?? "";
  return "";
}

function setValue(state: FichaState, path: string, value: string): FichaState {
  if (path === "ruc") return { ...state, ruc: value };
  const [section, key] = path.split(".") as [keyof FichaState, string];
  const block = { ...(state[section] as Record<string, string>), [key]: value };
  return { ...state, [section]: block };
}

type Props = {
  formRef: React.RefObject<HTMLFormElement | null>;
  ficha: FichaState;
  onChange: (f: FichaState) => void;
};

export function DemoFichaForm({ formRef, ficha, onChange }: Props) {
  return (
    <form ref={formRef} className="demo-ficha" id="contam-demo-ficha-ruc">
      <h2>Ficha RUC (demo Composer)</h2>
      <p className="hint">
        Campos con <code>data-ai-field</code> — el Composer los rellena desde BD (read-only), sin Guardar.
      </p>
      <div className="demo-grid">
        {DEMO_FIELDS.map((f) => (
          <label key={f.path} className="demo-field">
            <span>{f.label}</span>
            <input
              type={f.type ?? "text"}
              data-ai-field={f.path}
              data-ai-label={f.label}
              value={getValue(ficha, f.path)}
              onChange={(e) => onChange(setValue(ficha, f.path, e.target.value))}
            />
          </label>
        ))}
      </div>
      <button type="button" className="demo-save" data-ai-sensitive="true" disabled title="Solo el contador guarda">
        Guardar (solo contador)
      </button>
    </form>
  );
}

export function useDemoPageContext(
  formRef: React.RefObject<HTMLFormElement | null>,
  ficha: FichaState,
): PageContext {
  return useMemo(
    () => ({
      page_id: "ficha-ruc",
      route: "/ficha-ruc",
      ruc: ficha.ruc,
      title: "Ficha RUC — demo",
      fields: formRef.current
        ? scanFormFields(formRef.current)
        : DEMO_FIELDS.map((f) => ({
            field_path: f.path,
            label: f.label,
            value: getValue(ficha, f.path),
          })),
    }),
    [ficha, formRef],
  );
}

export type { FichaState };
export { EMPTY as EMPTY_FICHA, DEMO_FIELDS };
