import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";

/**
 * Login DOA – PrimeReact (Glass Morado)
 *
 * - 100% PrimeReact en inputs/botones.
 * - Tarjeta estilo "glass" con blur, borde sutil y glow morado.
 * - Fondo con gradiente animado + (opcional) imagen.
 * - Layout responsivo y centrado.
 * - Props para enganchar tus handlers reales de autenticación.
 */

export default function LoginDOA({
  backgroundUrl,
  onLogin,
  onForgot,
  onSolicitante,
}: {
  /** URL opcional para la imagen de fondo. Si no se envía, solo se usa el gradiente. */
  backgroundUrl?: string;
  /** Handler para el submit (username, password, rememberMe) */
  onLogin?: (payload: { username: string; password: string; remember: boolean }) => void;
  onForgot?: () => void;
  onSolicitante?: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const bgStyle = useMemo<React.CSSProperties>(() => ({
    backgroundImage: `linear-gradient(115deg, var(--amber-400), var(--fucsia-500) 40%, var(--violet-700)), ${
      backgroundUrl ? `url(${backgroundUrl})` : ""
    }`,
    backgroundSize: backgroundUrl ? "cover, cover" : "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }), [backgroundUrl]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin?.({ username, password, remember });
  }

  function handleClear() {
    setUsername("");
    setPassword("");
    setRemember(true);
  }

  return (
    <div className="doa-login-root" style={bgStyle}>
      {/* decorativo del texto CLARIOS grande en el fondo */}
      <div className="brand-ghost">CLARIOS</div>

      <div className="glass-card">
        <header className="card-head">
          <div className="brand">
            <span className="brand-mark" aria-hidden>➤</span>
            <span className="brand-name">CLARIOS</span>
          </div>
          <div className="product">DOA</div>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <p className="subtitle">Inicia sesión para continuar</p>

          <label className="label">Global ID</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-user" />
            <InputText
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full"
            />
          </span>

          <label className="label mt-3">Contraseña</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-lock" />
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
              inputClassName="w-full"
              placeholder="Password"
            />
          </span>

          <div className="row between mt-2">
            <div className="row gap-2">
              <Checkbox inputId="remember" checked={remember} onChange={(e) => setRemember(!!e.checked)} />
              <label htmlFor="remember" className="remember">Recordarme</label>
            </div>
            <button type="button" className="link" onClick={onForgot}>¿Olvidaste tu contraseña?</button>
          </div>

          <div className="actions">
            <Button type="submit" icon="pi pi-sign-in" label="Ingresar" className="p-button-rounded p-button-lg doa-primary" />
            <Button type="button" label="Limpiar" className="p-button-rounded p-button-outlined p-button-lg" onClick={handleClear} />
            <Button type="button" label="Solicitante" className="p-button-rounded p-button-secondary p-button-lg doa-secondary" onClick={onSolicitante} />
          </div>

          <small className="footnote">DOA Clarios</small>
        </form>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
:root{
  /* Paleta base glass morado */
  --violet-700: #7c3aed;
  --plum-500: #a855f7;
  --fucsia-500:#d946ef;
  --amber-400:#f59e0b;
  --glass-bg: rgba(255,255,255,0.14);
  --glass-border: rgba(255,255,255,0.35);
  --glass-shadow: 0 20px 40px rgba(124, 58, 237, 0.35);
}

.doa-login-root{
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  animation: hue 18s linear infinite;
}

/* Texto fantasma de fondo */
.brand-ghost{
  position: absolute; inset: 0;
  display: grid; place-items: center end;
  padding-right: clamp(4rem, 10vw, 12rem);
  font-size: clamp(6rem, 12vw, 16rem);
  letter-spacing: .25rem;
  font-weight: 700;
  color: rgba(255,255,255,0.28);
  mix-blend-mode: overlay;
  user-select: none;
  pointer-events: none;
}

.glass-card{
  width: min(640px, 92vw);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  border-radius: 22px;
  padding: 28px 28px 22px 28px;
}

.card-head{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom: 10px;
}
.brand{display:flex; align-items:center; gap:.6rem}
.brand-mark{color: white; filter: drop-shadow(0 0 8px rgba(255,255,255,.4));}
.brand-name{font-weight:800; letter-spacing:.16rem; color:white}
.product{font-weight:800; font-size: 1.8rem; background: linear-gradient(90deg, #ff80bf, #ffd1ff);
  -webkit-background-clip:text; background-clip:text; color:transparent}

.subtitle{margin:.25rem 0 1rem 0; color:white; opacity:.9}

.form{display:flex; flex-direction:column}
.label{color:white; opacity:.92; font-size:.9rem; margin:.5rem 0 .25rem}

.row{display:flex; align-items:center}
.between{justify-content:space-between}
.gap-2{gap:.5rem}
.remember{color:white; opacity:.9}
.link{background:none; border:none; color:white; opacity:.9; text-decoration:underline; cursor:pointer}

.actions{display:grid; grid-template-columns: 1fr 1fr 1fr; gap:.75rem; margin-top: 1rem}
@media (max-width: 560px){ .actions{grid-template-columns: 1fr;}}

.doa-primary{background: linear-gradient(90deg, var(--plum-500), var(--violet-700)); border: none}
.doa-secondary{background: linear-gradient(90deg, #ff7ab6, #ff9ceb); border: none}

.footnote{display:block; text-align:center; margin-top:1rem; color:white; opacity:.85}

/* animación sutil de tono */
@keyframes hue{ 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(20deg)} }
`;
