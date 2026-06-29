import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Save, User, UserCircle } from "lucide-react";
import { toast } from "sonner";

import { FieldHelper } from "@/components/ui/field-helper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_app/mi-cuenta")({
  component: MiCuentaPage,
});

function MiCuentaPage() {
  const { session } = useSession();
  const { institutionalEmail, setInstitutionalEmail } = useNotifications();
  const [emailInput, setEmailInput] = useState(institutionalEmail);
  const [emailError, setEmailError] = useState("");

  const userEmail = session?.user.email ?? "";
  const userName = session?.user.user_metadata?.nombre ?? userEmail.split("@")[0] ?? "Usuario";

  useEffect(() => {
    setEmailInput(institutionalEmail);
  }, [institutionalEmail]);

  function validateInstitutionalEmail(value: string): string {
    if (!value.trim()) return "Ingrese su correo institucional para habilitar la sincronización con Gmail.";
    if (!value.includes("@")) return "El correo debe contener el símbolo @ y un dominio válido (ej. usuario@empresa.pe).";
    if (!/\.(pe|com|gob\.pe|edu\.pe)$/i.test(value.split("@")[1] ?? "")) {
      return "Use un dominio institucional válido (.pe, .com, .gob.pe o .edu.pe).";
    }
    return "";
  }

  function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    const error = validateInstitutionalEmail(emailInput);
    setEmailError(error);
    if (error) return;

    setInstitutionalEmail(emailInput);
    toast.success("Correo institucional guardado. Los mensajes aparecerán en la pestaña Correos.");
  }

  return (
    <div className="p-6 max-w-[720px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
          <UserCircle className="size-8 text-primary" />
          Mi Cuenta
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure su perfil y el correo institucional para recibir notificaciones de Gmail.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4" />
            Datos de sesión
          </CardTitle>
          <CardDescription>Información asociada a su cuenta de acceso en CONTAM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre del contador</Label>
            <Input value={userName} disabled className="bg-muted/50" />
            <FieldHelper>
              Nombre registrado en el perfil de autenticación. Para modificarlo, contacte al administrador del sistema.
            </FieldHelper>
          </div>
          <div className="space-y-1.5">
            <Label>Correo de acceso</Label>
            <Input value={userEmail} disabled className="bg-muted/50" />
            <FieldHelper>
              Correo utilizado para iniciar sesión en CONTAM. No se usa para la extracción de Gmail institucional.
            </FieldHelper>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="size-4" />
            Correo institucional (Gmail)
          </CardTitle>
          <CardDescription>
            Vincule su bandeja institucional para que CONTAM extraiga mensajes relevantes al proceso contable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="institutional-email">Correo Gmail institucional</Label>
              <Input
                id="institutional-email"
                type="email"
                placeholder="contador@empresa.pe"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError("");
                }}
                aria-invalid={!!emailError}
              />
              {emailError ? (
                <FieldHelper variant="error">{emailError}</FieldHelper>
              ) : (
                <FieldHelper variant="info">
                  Ingrese el correo corporativo autorizado. Los mensajes de SUNAT, tesorería y contabilidad
                  se mostrarán en el panel de notificaciones, pestaña «Correos».
                </FieldHelper>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <FieldHelper className="flex-1">
                {institutionalEmail
                  ? `Sincronización activa con: ${institutionalEmail}`
                  : "Sin correo configurado — las notificaciones por correo no estarán disponibles."}
              </FieldHelper>
              <Button type="submit" className="shrink-0">
                <Save className="size-4 mr-2" />
                Guardar correo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
