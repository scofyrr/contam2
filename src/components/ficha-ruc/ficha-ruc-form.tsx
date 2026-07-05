import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DynamicArrayBlock,
} from "@/components/contribuyentes/dynamic-array-block";
import {
  Field,
  FormGrid,
  SectionBody,
  SectionHeader,
} from "@/components/contribuyentes/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FichaRuc } from "@/lib/contribuyentes-types";
import { aiFieldAttrs } from "@/lib/ai-composer-fill";
import {
  emptyEstablecimiento,
  emptyPersonaVinculada,
  emptyRepresentante,
  emptyTributoAfecto,
} from "@/lib/contribuyentes-factory";

const TIPOS_CONTRIBUYENTE = [
  "PERSONA NATURAL",
  "PERSONA JURÍDICA",
  "SUcesión Indivisa",
  "Otros",
];

type Props = {
  ficha: FichaRuc;
  onChange: (ficha: FichaRuc) => void;
};

export function FichaRucForm({ ficha, onChange }: Props) {
  const patch = (partial: Partial<FichaRuc>) => onChange({ ...ficha, ...partial });

  const patchGeneral = (key: keyof FichaRuc["general"], value: string) =>
    onChange({ ...ficha, general: { ...ficha.general, [key]: value } });

  const patchMod = (key: keyof FichaRuc["modificacionContribuyente"], value: string) =>
    onChange({
      ...ficha,
      modificacionContribuyente: { ...ficha.modificacionContribuyente, [key]: value },
    });

  const patchDom = (key: keyof FichaRuc["domicilioFiscal"], value: string) =>
    onChange({ ...ficha, domicilioFiscal: { ...ficha.domicilioFiscal, [key]: value } });

  const patchPn = (key: keyof FichaRuc["personaNatural"], value: string) =>
    onChange({ ...ficha, personaNatural: { ...ficha.personaNatural, [key]: value } });

  const patchEmp = (key: keyof FichaRuc["empresa"], value: string) =>
    onChange({ ...ficha, empresa: { ...ficha.empresa, [key]: value } });

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="general">Datos generales</TabsTrigger>
        <TabsTrigger value="tributos">Tributos</TabsTrigger>
        <TabsTrigger value="representantes">Representantes</TabsTrigger>
        <TabsTrigger value="vinculados">Vinculados</TabsTrigger>
        <TabsTrigger value="establecimientos">Establecimientos</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-0 mt-0">
      <div className="mb-6">
        <SectionHeader
          title="Sección A — Información General del Contribuyente"
          subtitle="Bloque visual fijo (estilo SUNAT)"
        />
        <SectionBody>
          <FormGrid>
            <Field label="Apellidos y Nombres o Razón Social" required aiFieldPath="general.razonSocial">
              <Input
                {...aiFieldAttrs("general.razonSocial", "Razón Social")}
                value={ficha.general.razonSocial}
                onChange={(e) => patchGeneral("razonSocial", e.target.value)}
              />
            </Field>
            <Field label="Tipo de Contribuyente" required aiFieldPath="general.tipoContribuyente">
              <Select
                value={ficha.general.tipoContribuyente || undefined}
                onValueChange={(v) => patchGeneral("tipoContribuyente", v)}
              >
                <SelectTrigger {...aiFieldAttrs("general.tipoContribuyente", "Tipo de Contribuyente")}>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CONTRIBUYENTE.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fecha de Inscripción" required aiFieldPath="general.fechaInscripcion">
              <Input
                type="date"
                {...aiFieldAttrs("general.fechaInscripcion", "Fecha de Inscripción")}
                value={ficha.general.fechaInscripcion}
                onChange={(e) => patchGeneral("fechaInscripcion", e.target.value)}
              />
            </Field>
            <Field label="Fecha de Inicio de Actividades" aiFieldPath="general.fechaInicioActividades">
              <Input
                type="date"
                {...aiFieldAttrs("general.fechaInicioActividades", "Fecha de Inicio de Actividades")}
                value={ficha.general.fechaInicioActividades}
                onChange={(e) => patchGeneral("fechaInicioActividades", e.target.value)}
              />
            </Field>
            <Field label="Estado del Contribuyente" aiFieldPath="general.estadoContribuyente">
              <Input
                {...aiFieldAttrs("general.estadoContribuyente", "Estado del Contribuyente")}
                value={ficha.general.estadoContribuyente}
                onChange={(e) => patchGeneral("estadoContribuyente", e.target.value)}
              />
            </Field>
            <Field label="Dependencia SUNAT" aiFieldPath="general.dependenciaSunat">
              <Input
                {...aiFieldAttrs("general.dependenciaSunat", "Dependencia SUNAT")}
                value={ficha.general.dependenciaSunat}
                onChange={(e) => patchGeneral("dependenciaSunat", e.target.value)}
              />
            </Field>
            <Field label="Condición de Domicilio Fiscal" aiFieldPath="general.condicionDomicilioFiscal">
              <Input
                {...aiFieldAttrs("general.condicionDomicilioFiscal", "Condición Domicilio Fiscal")}
                value={ficha.general.condicionDomicilioFiscal}
                onChange={(e) => patchGeneral("condicionDomicilioFiscal", e.target.value)}
              />
            </Field>
            <Field label="Emisor electrónico desde" aiFieldPath="general.emisorElectronicoDesde">
              <Input
                type="date"
                {...aiFieldAttrs("general.emisorElectronicoDesde", "Emisor electrónico desde")}
                value={ficha.general.emisorElectronicoDesde}
                onChange={(e) => patchGeneral("emisorElectronicoDesde", e.target.value)}
              />
            </Field>
            <Field label="Comprobantes electrónicos" aiFieldPath="general.comprobantesElectronicos">
              <Input
                {...aiFieldAttrs("general.comprobantesElectronicos", "Comprobantes electrónicos")}
                value={ficha.general.comprobantesElectronicos}
                onChange={(e) => patchGeneral("comprobantesElectronicos", e.target.value)}
              />
            </Field>
            <Field label="Fecha de Baja" aiFieldPath="general.fechaBaja">
              <Input
                type="date"
                {...aiFieldAttrs("general.fechaBaja", "Fecha de Baja")}
                value={ficha.general.fechaBaja}
                onChange={(e) => patchGeneral("fechaBaja", e.target.value)}
              />
            </Field>
          </FormGrid>
        </SectionBody>
      </div>

      <div className="mb-6">
        <SectionHeader title="Sección B — Para modificar los datos del Contribuyente" />
        <SectionBody>
          <FormGrid>
            {(
              [
                ["nombreComercial", "Nombre Comercial"],
                ["tipoRepresentacion", "Tipo de Representación"],
                ["actividadEconomicaPrincipal", "Actividad Económica Principal"],
                ["actividadEconomicaSecundaria1", "Actividad Económica Secundaria 1"],
                ["actividadEconomicaSecundaria2", "Actividad Económica Secundaria 2"],
                ["sistemaEmisionComprobantes", "Sistema Emisión Comprobantes de Pago"],
                ["sistemaContabilidad", "Sistema de Contabilidad"],
                ["codigoProfesionOficio", "Código de Profesión / Oficio"],
                ["actividadComercioExterior", "Actividad de Comercio Exterior"],
                ["numeroFax", "Número Fax"],
                ["telefonoFijo1", "Teléfono Fijo 1"],
                ["telefonoFijo2", "Teléfono Fijo 2"],
                ["telefonoMovil1", "Teléfono Móvil 1"],
                ["telefonoMovil2", "Teléfono Móvil 2"],
                ["correoElectronico1", "Correo Electrónico 1"],
                ["correoElectronico2", "Correo Electrónico 2"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} aiFieldPath={`modificacionContribuyente.${key}`}>
                <Input
                  {...aiFieldAttrs(`modificacionContribuyente.${key}`, label)}
                  value={ficha.modificacionContribuyente[key]}
                  onChange={(e) => patchMod(key, e.target.value)}
                />
              </Field>
            ))}
          </FormGrid>
        </SectionBody>
      </div>

      <div className="mb-6">
        <SectionHeader title="Sección C — Para modificar los datos de Domicilio Fiscal" />
        <SectionBody>
          <FormGrid>
            {(
              [
                ["actividadEconomica", "Actividad Económica"],
                ["departamento", "Departamento"],
                ["provincia", "Provincia"],
                ["distrito", "Distrito"],
                ["tipoNombreZona", "Tipo y Nombre Zona"],
                ["tipoNombreVia", "Tipo y Nombre Vía"],
                ["nroKmMzLote", "Nro / Km / Mz / Lote / Dpto / Interior"],
                ["otrasReferencias", "Otras Referencias"],
                ["condicionInmueble", "Condición del inmueble (Domicilio Fiscal)"],
                ["licenciaMunicipal", "Licencia Municipal"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} aiFieldPath={`domicilioFiscal.${key}`}>
                <Input
                  {...aiFieldAttrs(`domicilioFiscal.${key}`, label)}
                  value={ficha.domicilioFiscal[key]}
                  onChange={(e) => patchDom(key, e.target.value)}
                />
              </Field>
            ))}
          </FormGrid>
        </SectionBody>
      </div>

      <div className="mb-6">
        <SectionHeader title="Sección D — Para modificar los datos de la Persona Natural" />
        <SectionBody>
          <FormGrid>
            {(
              [
                ["documentoIdentidad", "Documento de Identidad"],
                ["fechaNacimientoSucesion", "Fecha de Nacimiento o Inicio Sucesión"],
                ["sexo", "Sexo"],
                ["pasaporte", "Pasaporte"],
                ["nacionalidad", "Nacionalidad"],
                ["paisProcedencia", "País de Procedencia"],
                ["condDomiciliado", "Cond. Domiciliado"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} aiFieldPath={`personaNatural.${key}`}>
                {key === "fechaNacimientoSucesion" ? (
                  <Input
                    type="date"
                    {...aiFieldAttrs(`personaNatural.${key}`, label)}
                    value={ficha.personaNatural[key]}
                    onChange={(e) => patchPn(key, e.target.value)}
                  />
                ) : (
                  <Input
                    {...aiFieldAttrs(`personaNatural.${key}`, label)}
                    value={ficha.personaNatural[key]}
                    onChange={(e) => patchPn(key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </FormGrid>
        </SectionBody>
      </div>

      <div className="mb-6">
        <SectionHeader title="Sección E — Para modificar los datos de la Empresa" />
        <SectionBody>
          <FormGrid>
            {(
              [
                ["fechaInscripcionRrPp", "Fecha Inscripción RR.PP"],
                ["numeroPartidaRegistral", "Número de Partida Registral"],
                ["tomoFichaFolioAsiento", "Tomo / Ficha / Folio / Asiento"],
                ["origenCapital", "Origen del Capital"],
                ["paisOrigenCapital", "País de Origen del Capital"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} aiFieldPath={`empresa.${key}`}>
                {key === "fechaInscripcionRrPp" ? (
                  <Input
                    type="date"
                    {...aiFieldAttrs(`empresa.${key}`, label)}
                    value={ficha.empresa[key]}
                    onChange={(e) => patchEmp(key, e.target.value)}
                  />
                ) : (
                  <Input
                    {...aiFieldAttrs(`empresa.${key}`, label)}
                    value={ficha.empresa[key]}
                    onChange={(e) => patchEmp(key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </FormGrid>
        </SectionBody>
      </div>

      </TabsContent>

      <TabsContent value="tributos" className="mt-0">
      <DynamicArrayBlock
        title="Tributo Afecto"
        items={ficha.tributosAfectos}
        onAdd={() =>
          patch({ tributosAfectos: [...ficha.tributosAfectos, emptyTributoAfecto()] })
        }
        onRemove={(i) =>
          patch({
            tributosAfectos: ficha.tributosAfectos.filter((_, idx) => idx !== i),
          })
        }
        renderItem={(row, i) => (
          <FormGrid>
            {(
              [
                ["tributo", "Tributo"],
                ["fechaAlta", "Fecha de alta"],
                ["afectoDesde", "Afecto desde"],
                ["marcaExoneracion", "Marca de Exoneración"],
                ["exoneracionDesde", "Exoneración desde"],
                ["hasta", "Hasta"],
                ["modificacion", "Modificación"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type={key.includes("fecha") || key === "hasta" ? "date" : "text"}
                  value={row[key]}
                  onChange={(e) => {
                    const list = [...ficha.tributosAfectos];
                    list[i] = { ...list[i], [key]: e.target.value };
                    patch({ tributosAfectos: list });
                  }}
                />
              </Field>
            ))}
          </FormGrid>
        )}
      />
      </TabsContent>

      <TabsContent value="representantes" className="mt-0">
      <DynamicArrayBlock
        title="Representante Legal"
        items={ficha.representantesLegales}
        onAdd={() =>
          patch({
            representantesLegales: [...ficha.representantesLegales, emptyRepresentante()],
          })
        }
        onRemove={(i) =>
          patch({
            representantesLegales: ficha.representantesLegales.filter((_, idx) => idx !== i),
          })
        }
        renderItem={(row, i) => (
          <FormGrid>
            {(
              [
                ["tipoNroDoc", "Tipo y Nro.Doc."],
                ["apellidosNombres", "Apellidos y Nombres"],
                ["fechaNacimiento", "Fecha de Nacimiento"],
                ["cargo", "Cargo"],
                ["fechaDesde", "Fecha Desde"],
                ["nroOrdenRepresentacion", "Nro. Orden de Representación"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type={key.includes("fecha") ? "date" : "text"}
                  value={row[key]}
                  onChange={(e) => {
                    const list = [...ficha.representantesLegales];
                    list[i] = { ...list[i], [key]: e.target.value };
                    patch({ representantesLegales: list });
                  }}
                />
              </Field>
            ))}
          </FormGrid>
        )}
      />
      </TabsContent>

      <TabsContent value="vinculados" className="mt-0">
      <DynamicArrayBlock
        title="Otras Personas Vinculadas"
        items={ficha.personasVinculadas}
        onAdd={() =>
          patch({
            personasVinculadas: [...ficha.personasVinculadas, emptyPersonaVinculada()],
          })
        }
        onRemove={(i) =>
          patch({
            personasVinculadas: ficha.personasVinculadas.filter((_, idx) => idx !== i),
          })
        }
        renderItem={(row, i) => (
          <FormGrid>
            {(
              [
                ["tipoNroDoc", "Tipo y Nro.Doc."],
                ["apellidosNombres", "Apellidos y Nombres"],
                ["fechaNacimiento", "Fecha de Nacimiento"],
                ["vinculo", "Vínculo"],
                ["fechaDesde", "Fecha Desde"],
                ["residencia", "Residencia"],
                ["porcentaje", "Porcentaje"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  type={key.includes("fecha") ? "date" : "text"}
                  value={row[key]}
                  onChange={(e) => {
                    const list = [...ficha.personasVinculadas];
                    list[i] = { ...list[i], [key]: e.target.value };
                    patch({ personasVinculadas: list });
                  }}
                />
              </Field>
            ))}
          </FormGrid>
        )}
      />
      </TabsContent>

      <TabsContent value="establecimientos" className="mt-0">
      <DynamicArrayBlock
        title="Establecimientos Anexos"
        items={ficha.establecimientosAnexos}
        onAdd={() =>
          patch({
            establecimientosAnexos: [
              ...ficha.establecimientosAnexos,
              emptyEstablecimiento(),
            ],
          })
        }
        onRemove={(i) =>
          patch({
            establecimientosAnexos: ficha.establecimientosAnexos.filter(
              (_, idx) => idx !== i,
            ),
          })
        }
        renderItem={(row, i) => (
          <FormGrid>
            {(
              [
                ["codigo", "Código"],
                ["tipo", "Tipo"],
                ["denominacion", "Denominación"],
                ["ubigeo", "Ubigeo"],
                ["domicilio", "Domicilio"],
                ["otrasReferencias", "Otras Referencias"],
                ["condLegal", "Cond.Legal"],
                ["licenciaMunicipal", "Licencia Municipal"],
                ["actEcon", "Act. Econ."],
                ["modificacion", "Modificación"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  value={row[key]}
                  onChange={(e) => {
                    const list = [...ficha.establecimientosAnexos];
                    list[i] = { ...list[i], [key]: e.target.value };
                    patch({ establecimientosAnexos: list });
                  }}
                />
              </Field>
            ))}
          </FormGrid>
        )}
      />
      </TabsContent>
    </Tabs>
  );
}
