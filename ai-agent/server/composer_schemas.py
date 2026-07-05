"""Esquemas de formularios CONTAM para modo Composer (solo lectura / relleno UI)."""

from __future__ import annotations

from typing import Any

# Rutas soportadas → metadatos de página
PAGE_REGISTRY: dict[str, dict[str, Any]] = {
    "ficha-ruc": {
        "title": "Ficha RUC",
        "description": "Formulario estilo SUNAT — Sección A y bloques relacionados",
        "sensitive_actions": ["guardar", "emitir", "pagar", "enviar", "declarar"],
        "fields": [
            {"path": "ruc", "label": "RUC", "section": "general"},
            {"path": "general.razonSocial", "label": "Apellidos y Nombres o Razón Social", "section": "general"},
            {"path": "general.tipoContribuyente", "label": "Tipo de Contribuyente", "section": "general"},
            {"path": "general.fechaInscripcion", "label": "Fecha de Inscripción", "section": "general"},
            {"path": "general.fechaInicioActividades", "label": "Fecha de Inicio de Actividades", "section": "general"},
            {"path": "general.estadoContribuyente", "label": "Estado del Contribuyente", "section": "general"},
            {"path": "general.dependenciaSunat", "label": "Dependencia SUNAT", "section": "general"},
            {"path": "general.condicionDomicilioFiscal", "label": "Condición Domicilio Fiscal", "section": "general"},
            {"path": "general.emisorElectronicoDesde", "label": "Emisor Electrónico Desde", "section": "general"},
            {"path": "general.comprobantesElectronicos", "label": "Comprobantes Electrónicos", "section": "general"},
            {"path": "general.fechaBaja", "label": "Fecha de Baja", "section": "general"},
            {"path": "modificacionContribuyente.nombreComercial", "label": "Nombre Comercial", "section": "modificacion"},
            {"path": "modificacionContribuyente.tipoRepresentacion", "label": "Tipo Representación", "section": "modificacion"},
            {"path": "modificacionContribuyente.actividadEconomicaPrincipal", "label": "Actividad Económica Principal", "section": "modificacion"},
            {"path": "modificacionContribuyente.actividadEconomicaSecundaria1", "label": "Actividad Económica Secundaria 1", "section": "modificacion"},
            {"path": "modificacionContribuyente.actividadEconomicaSecundaria2", "label": "Actividad Económica Secundaria 2", "section": "modificacion"},
            {"path": "modificacionContribuyente.sistemaEmisionComprobantes", "label": "Sistema Emisión Comprobantes", "section": "modificacion"},
            {"path": "modificacionContribuyente.sistemaContabilidad", "label": "Sistema Contabilidad", "section": "modificacion"},
            {"path": "modificacionContribuyente.codigoProfesionOficio", "label": "Código Profesión u Oficio", "section": "modificacion"},
            {"path": "modificacionContribuyente.actividadComercioExterior", "label": "Actividad Comercio Exterior", "section": "modificacion"},
            {"path": "modificacionContribuyente.numeroFax", "label": "Número Fax", "section": "modificacion"},
            {"path": "modificacionContribuyente.telefonoFijo1", "label": "Teléfono Fijo 1", "section": "modificacion"},
            {"path": "modificacionContribuyente.telefonoFijo2", "label": "Teléfono Fijo 2", "section": "modificacion"},
            {"path": "modificacionContribuyente.telefonoMovil1", "label": "Teléfono Móvil 1", "section": "modificacion"},
            {"path": "modificacionContribuyente.telefonoMovil2", "label": "Teléfono Móvil 2", "section": "modificacion"},
            {"path": "modificacionContribuyente.correoElectronico1", "label": "Correo Electrónico 1", "section": "modificacion"},
            {"path": "modificacionContribuyente.correoElectronico2", "label": "Correo Electrónico 2", "section": "modificacion"},
            {"path": "domicilioFiscal.actividadEconomica", "label": "Actividad Económica (domicilio)", "section": "domicilio"},
            {"path": "domicilioFiscal.departamento", "label": "Departamento", "section": "domicilio"},
            {"path": "domicilioFiscal.provincia", "label": "Provincia", "section": "domicilio"},
            {"path": "domicilioFiscal.distrito", "label": "Distrito", "section": "domicilio"},
            {"path": "domicilioFiscal.tipoNombreZona", "label": "Tipo y Nombre de Zona", "section": "domicilio"},
            {"path": "domicilioFiscal.tipoNombreVia", "label": "Tipo y Nombre de Vía", "section": "domicilio"},
            {"path": "domicilioFiscal.nroKmMzLote", "label": "Nro / Km / Mz / Lote", "section": "domicilio"},
            {"path": "domicilioFiscal.otrasReferencias", "label": "Otras Referencias", "section": "domicilio"},
            {"path": "domicilioFiscal.condicionInmueble", "label": "Condición Inmueble", "section": "domicilio"},
            {"path": "domicilioFiscal.licenciaMunicipal", "label": "Licencia Municipal", "section": "domicilio"},
            {"path": "personaNatural.documentoIdentidad", "label": "Documento de Identidad", "section": "persona_natural"},
            {"path": "personaNatural.fechaNacimientoSucesion", "label": "Fecha Nacimiento / Sucesión", "section": "persona_natural"},
            {"path": "personaNatural.sexo", "label": "Sexo", "section": "persona_natural"},
            {"path": "personaNatural.pasaporte", "label": "Pasaporte", "section": "persona_natural"},
            {"path": "personaNatural.nacionalidad", "label": "Nacionalidad", "section": "persona_natural"},
            {"path": "personaNatural.paisProcedencia", "label": "País Procedencia", "section": "persona_natural"},
            {"path": "personaNatural.condDomiciliado", "label": "Condición Domiciliado", "section": "persona_natural"},
            {"path": "empresa.fechaInscripcionRrPp", "label": "Fecha Inscripción RR.PP.", "section": "empresa"},
            {"path": "empresa.numeroPartidaRegistral", "label": "Número Partida Registral", "section": "empresa"},
            {"path": "empresa.tomoFichaFolioAsiento", "label": "Tomo / Ficha / Folio / Asiento", "section": "empresa"},
            {"path": "empresa.origenCapital", "label": "Origen Capital", "section": "empresa"},
            {"path": "empresa.paisOrigenCapital", "label": "País Origen Capital", "section": "empresa"},
        ],
    },
    "contribuyentes": {
        "title": "Contribuyente (maestro)",
        "description": "Datos maestros del cliente — categorías y estado",
        "sensitive_actions": ["guardar", "eliminar"],
        "fields": [
            {"path": "ruc", "label": "RUC", "section": "general"},
            {"path": "razonSocial", "label": "Razón Social", "section": "general"},
            {"path": "estado", "label": "Estado", "section": "general"},
            {"path": "otros", "label": "Otros", "section": "general"},
            {"path": "fechaVencimientoDeclaracion", "label": "Fecha Vencimiento Declaración", "section": "general"},
        ],
    },
}


def get_page_schema(page_id: str) -> dict[str, Any] | None:
    return PAGE_REGISTRY.get(page_id)


def list_supported_pages() -> list[dict[str, str]]:
    return [
        {"page_id": pid, "title": meta["title"], "description": meta["description"]}
        for pid, meta in PAGE_REGISTRY.items()
    ]
