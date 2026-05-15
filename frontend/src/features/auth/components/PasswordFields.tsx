import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  password: string;
  confirmarPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmarPasswordChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Password + confirmar con ojitos para mostrar/ocultar.
 * Indica visualmente si coinciden o no.
 */
export function PasswordFields({
  password,
  confirmarPassword,
  onPasswordChange,
  onConfirmarPasswordChange,
  disabled,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const passwordsCoinciden =
    password === confirmarPassword && password.length >= 6;
  const passwordsNoCoinciden =
    confirmarPassword.length > 0 && password !== confirmarPassword;

  return (
    <>
      {/* Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={disabled}
            minLength={6}
            required
            className="h-11 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmar-password">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="confirmar-password"
            type={showConfirmar ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Vuelve a escribir tu contraseña"
            value={confirmarPassword}
            onChange={(e) => onConfirmarPasswordChange(e.target.value)}
            disabled={disabled}
            minLength={6}
            required
            className="h-11 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmar(!showConfirmar)}
            tabIndex={-1}
            aria-label={
              showConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmar ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {passwordsNoCoinciden && (
          <p className="text-xs text-destructive">
            Las contraseñas no coinciden
          </p>
        )}
        {passwordsCoinciden && (
          <p className="text-xs text-success">Las contraseñas coinciden</p>
        )}
      </div>
    </>
  );
}