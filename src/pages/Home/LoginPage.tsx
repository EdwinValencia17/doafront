import { useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLogin } from "@/hooks/auth/useLogin";
import LoginFormPlain from "./LoginForm";

export default function LoginPage() {
  const nav = useNavigate();
  const { hydrated, accessToken, user } = useAuth();
  const { busy, error, submit, setError } = useLogin();

  if (!hydrated) return null;
  if (accessToken && user) return <Navigate to="/" replace />;

  const canSubmit = useMemo(() => !busy, [busy]);

  return (
    <div className="login-shell">
      {/* Card combinado */}
      <section className="login-card">
        {/* Lado izquierdo (hero) */}
        <aside className="login-hero">
          <div className="logo-mask" aria-label="Clarios DOA" />
          <h1 className="hero-title shine-text">¡Hola, bienvenido!</h1>
          <p className="hero-copy shine-text soft">
            Accede a DOA para gestionar y consultar tus órdenes con un flujo simple y seguro.
          </p>

          {/* Aquí va lo que antes era REGISTER → CONSULTAR ÓRDENES */}
          <button
            className="btn-ghost shine-text soft"
            onClick={() => nav("/solicitante")}
            title="Ingresar a Consulta de Órdenes"
          >
            <span className="icon"></span>
            Consultar Órdenes
          </button>
        </aside>

        {/* Lado derecho (form) */}
        <main className="login-panel">
          <div className="panel-header">
            <h2 className="panel-title">Login</h2>
            <p className="panel-subtitle">Inicia sesión para continuar</p>
          </div>

          <LoginFormPlain
            busy={busy}
            error={error}
            onSubmit={async (p) => {
              if (!canSubmit) return;
              const ok = await submit(p);
              if (ok) nav("/");
            }}
            onForgot={() => setError("Recuperación de contraseña: pendiente")}
          />

          <div className="panel-footer"></div>
        </main>
      </section>
    </div>
  );
}
