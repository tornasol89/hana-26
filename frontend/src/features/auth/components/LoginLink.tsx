import { Link } from "react-router-dom";

/** "¿Ya tienes cuenta? Inicia sesión" — link al footer del card de registro. */
export function LoginLink() {
  return (
    <p className="text-center text-sm text-muted-foreground mt-6">
      ¿Ya tienes cuenta?{" "}
      <Link
        to="/login"
        className="text-primary font-semibold hover:underline transition-colors"
      >
        Inicia sesión
      </Link>
    </p>
  );
}