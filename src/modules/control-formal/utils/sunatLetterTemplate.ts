import type { Contribuyente } from "@/lib/contribuyentes-types";
import type {
  ContingenciaLibro,
  PlantillaComunicacionSunat,
} from "@/modules/control-formal/types/controlFormal";
import { formatFechaPeru } from "@/modules/control-formal/utils/sunatDeadlineCalculator";
import { MOTIVO_CONTINGENCIA_LABELS } from "@/modules/control-formal/types/controlFormal";

export interface ContribuyenteCarta {
  ruc: string;
  razonSocial: string;
  domicilioFiscal?: string;
  representanteLegal?: string;
}

export function mapContribuyenteCarta(c: Contribuyente, fichaDomicilio?: string): ContribuyenteCarta {
  return {
    ruc: c.ruc,
    razonSocial: c.razonSocial,
    domicilioFiscal: fichaDomicilio ?? "Domicilio fiscal registrado en SUNAT",
    representanteLegal: c.razonSocial,
  };
}

export function generarCartaComunicacionPerdida(
  contribuyente: ContribuyenteCarta,
  contingencia: ContingenciaLibro,
): PlantillaComunicacionSunat {
  const fechaOcurrencia = formatFechaPeru(new Date(contingencia.fechaOcurrencia + "T12:00:00"));
  const fechaLimiteCom = formatFechaPeru(new Date(contingencia.fechaLimiteComunicacion15d + "T12:00:00"));
  const motivoLabel = MOTIVO_CONTINGENCIA_LABELS[contingencia.motivo] ?? contingencia.motivo;

  const librosTexto = contingencia.librosAfectados
    .map(
      (l, i) =>
        `${i + 1}. ${l.nombreLibro} (Código Tabla 8: ${l.codigoLibroTabla8})${l.foliosAfectados ? ` — Folios: ${l.foliosAfectados}` : ""}`,
    )
    .join("\n");

  const cuerpoTexto = `
${contribuyente.razonSocial.toUpperCase()}
RUC N° ${contribuyente.ruc}
${contribuyente.domicilioFiscal ?? ""}

Lima, ${formatFechaPeru(new Date())}

Señores
SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACIÓN TRIBUTARIA — SUNAT
Mesa de Partes

ASUNTO: Comunicación de ${motivoLabel.toUpperCase()} de Libros y Registros Contables
REFERENCIA: Artículo 87° del Texto Único Ordenado del Código Tributario — Decreto Legislativo N° 830

De nuestra consideración:

Por medio de la presente, ${contribuyente.razonSocial}, identificado con RUC N° ${contribuyente.ruc}, cumple con comunicar a esa Entidad Recaudadora la ${motivoLabel.toLowerCase()} de los libros y/o registros contables detallados a continuación, ocurrida el ${fechaOcurrencia}, conforme a lo dispuesto por el Código Tributario peruano.

DETALLE DE LIBROS AFECTADOS:
${librosTexto}

DENUNCIA POLICIAL:
${contingencia.numeroDenunciaPolicial ? `N° ${contingencia.numeroDenunciaPolicial}${contingencia.comisaria ? ` — ${contingencia.comisaria}` : ""}` : "Adjuntamos copia certificada de la denuncia policial correspondiente."}

PLAZOS LEGALES:
- Comunicación a SUNAT (15 días hábiles): fecha límite ${fechaLimiteCom}
- Reconstrucción contable (60 días calendario): fecha límite ${formatFechaPeru(new Date(contingencia.fechaLimiteReconstruccion60d + "T12:00:00"))}

Adjuntamos:
1. Copia certificada expedida por la Autoridad Policial de la denuncia por ${motivoLabel.toLowerCase()} de libros contables.
2. Relación detallada de libros y folios afectados.

Nos comprometemos a iniciar la reconstrucción de los registros contables dentro del plazo legal, solicitando prórroga si fuera necesario.

Atentamente,

_________________________________
${contribuyente.representanteLegal ?? contribuyente.razonSocial}
Representante Legal / Gerente General
RUC: ${contribuyente.ruc}
`.trim();

  const librosHtml = contingencia.librosAfectados
    .map(
      (l) =>
        `<li><strong>${l.nombreLibro}</strong> (Tabla 8: ${l.codigoLibroTabla8})${l.foliosAfectados ? ` — Folios: ${l.foliosAfectados}` : ""}</li>`,
    )
    .join("");

  const cuerpoHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Comunicación SUNAT — ${motivoLabel}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 800px; margin: 40px auto; color: #111; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 13pt; margin: 0; }
    .fecha { text-align: right; margin: 24px 0; }
    .destinatario { margin: 24px 0; }
    .asunto { margin: 16px 0; font-weight: bold; }
    .cuerpo p { text-align: justify; margin: 12px 0; }
    ul { margin: 8px 0 16px 20px; }
    .firma { margin-top: 48px; }
    .anexos { margin-top: 24px; font-size: 11pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${contribuyente.razonSocial.toUpperCase()}</h1>
    <p>RUC N° ${contribuyente.ruc}</p>
    <p>${contribuyente.domicilioFiscal ?? ""}</p>
  </div>
  <div class="fecha">Lima, ${formatFechaPeru(new Date())}</div>
  <div class="destinatario">
    <p><strong>Señores</strong><br/>
    SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACIÓN TRIBUTARIA — SUNAT<br/>
    Mesa de Partes</p>
  </div>
  <div class="asunto">
    <p>ASUNTO: Comunicación de ${motivoLabel.toUpperCase()} de Libros y Registros Contables</p>
    <p>REFERENCIA: Art. 87° TUO Código Tributario — D.L. N° 830</p>
  </div>
  <div class="cuerpo">
    <p>De nuestra consideración:</p>
    <p>Por medio de la presente, <strong>${contribuyente.razonSocial}</strong>, identificado con RUC N° <strong>${contribuyente.ruc}</strong>, comunica a esa Entidad Recaudadora la <strong>${motivoLabel.toLowerCase()}</strong> de los libros y/o registros contables detallados, ocurrida el <strong>${fechaOcurrencia}</strong>, conforme al Código Tributario peruano.</p>
    <p><strong>Detalle de libros afectados:</strong></p>
    <ul>${librosHtml}</ul>
    <p><strong>Denuncia policial:</strong> ${contingencia.numeroDenunciaPolicial ? `N° ${contingencia.numeroDenunciaPolicial}${contingencia.comisaria ? ` — ${contingencia.comisaria}` : ""}` : "Se adjunta copia certificada de la denuncia policial."}</p>
    <p><strong>Plazos legales:</strong></p>
    <ul>
      <li>Comunicación SUNAT (15 días hábiles): <strong>${fechaLimiteCom}</strong></li>
      <li>Reconstrucción contable (60 días calendario): <strong>${formatFechaPeru(new Date(contingencia.fechaLimiteReconstruccion60d + "T12:00:00"))}</strong></li>
    </ul>
    <p>Nos comprometemos a iniciar la reconstrucción de los registros contables dentro del plazo legal.</p>
  </div>
  <div class="firma">
    <p>Atentamente,</p>
    <br/><br/>
    <p>_________________________________<br/>
    ${contribuyente.representanteLegal ?? contribuyente.razonSocial}<br/>
    Representante Legal / Gerente General<br/>
    RUC: ${contribuyente.ruc}</p>
  </div>
  <div class="anexos">
    <p><strong>Anexos:</strong></p>
    <ol>
      <li>Copia certificada de denuncia policial</li>
      <li>Relación de libros y folios afectados</li>
    </ol>
  </div>
</body>
</html>`;

  return {
    titulo: `Comunicación SUNAT — ${motivoLabel} de libros contables`,
    cuerpoTexto,
    cuerpoHtml,
    fechaGeneracion: new Date().toISOString(),
  };
}

export function descargarCartaHtml(plantilla: PlantillaComunicacionSunat, filename?: string): void {
  const blob = new Blob([plantilla.cuerpoHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `carta-sunat-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function descargarCartaTexto(plantilla: PlantillaComunicacionSunat, filename?: string): void {
  const blob = new Blob([plantilla.cuerpoTexto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `carta-sunat-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Alias export requerido por spec */
export const generarCartaComunicacionPérdida = generarCartaComunicacionPerdida;
