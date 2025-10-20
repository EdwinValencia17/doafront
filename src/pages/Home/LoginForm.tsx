import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

export type LoginFormProps = {
  busy?: boolean;
  error?: string | null;
  onSubmit?: (p: {
    globalId: string;
    password: string;
    remember: boolean;
  }) => void | Promise<void>;
};

export default function LoginFormGlass({
  busy = false,
  error,
  onSubmit,
}: LoginFormProps) {
  const [globalId, setGlobalId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.({ globalId, password, remember });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="globalId" className="field-label">
        Global ID
      </label>
      <span className="p-input-icon-left glass-field">
        <i className="pi pi-user" />
        <InputText
          id="globalId"
          value={globalId}
          onChange={(e) => setGlobalId(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="glass-input"
          disabled={busy}
        />
      </span>

      <label htmlFor="password" className="field-label">
        Contraseña
      </label>
      <span className="p-input-icon-left glass-field">
        <i className="pi pi-lock" />
        <Password
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          toggleMask
          feedback={false}
          inputClassName="glass-input" // 👈 frosted al input interno
          disabled={busy}
        />
      </span>

      <div className="remember">
        <div className="remember-left">
          <Checkbox
            className="brand-check"
            inputId="remember"
            checked={remember}
            onChange={(e) => setRemember(!!e.checked)}
            disabled={busy}
          />
          <label htmlFor="remember">Recordarme</label>
        </div>
      </div>

      {!!error && (
        <div style={{ marginTop: 8 }}>
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 8 }}>
        <Button
          type="submit"
          icon="pi pi-sign-in"
          label={busy ? "Ingresando..." : "Ingresar"}
          disabled={busy}
          className="w-full"
        />
      </div>
    </form>
  );
}
