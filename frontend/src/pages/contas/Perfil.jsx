// Tela "Minha Conta": exibe e permite atualizar nome/gênero e alterar senha.
// Protegida via <ProtectedRoute> no roteador.
import React, { useEffect, useState } from "react";
import { useAuth } from "../../services/AuthContext";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../services/users";
import "./Perfil.css";

export default function Perfil() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", gender: "OUTRO" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          gender: data.gender || "OUTRO",
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function onSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const updated = await updateMyProfile({ name: profile.name, gender: profile.gender });
      setProfile((p) => ({ ...p, name: updated.name, gender: updated.gender }));
      setMsg("Perfil atualizado com sucesso!");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Falha ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setPwdMsg("");

    if (!pwd.currentPassword || pwd.newPassword.length < 8) {
      setPwdMsg("Senha nova precisa ter ao menos 8 caracteres.");
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      setPwdMsg("As senhas não coincidem.");
      return;
    }

    setPwdSaving(true);
    try {
      await changeMyPassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      setPwdMsg("Senha alterada com sucesso!");
    } catch (e) {
      setPwdMsg(e?.response?.data?.message || "Falha ao alterar senha.");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <div className="perfil-root">
      <div className="perfil-card">
        <header className="perfil-header">
          <div>
            <h1>Minha Conta</h1>
            <p>Gerencie seus dados e segurança.</p>
          </div>
          <button className="btn btn--ghost" onClick={logout}>Sair</button>
        </header>

        <section className="perfil-section">
          <h2>Dados pessoais</h2>
          <form className="perfil-form" onSubmit={onSaveProfile}>
            <div className="field">
              <label>Nome</label>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}/>
            </div>
            <div className="field">
              <label>E-mail</label>
              <input value={profile.email} disabled />
              <small className="muted">E-mail não pode ser alterado.</small>
            </div>
            <div className="field">
              <label>Gênero</label>
              <select value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <button className="btn btn--primary" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</button>
            {msg && <div className="perfil-msg">{msg}</div>}
          </form>
        </section>

        <section className="perfil-section">
          <h2>Segurança</h2>
          <form className="perfil-form" onSubmit={onChangePassword}>
            <div className="field">
              <label>Senha atual</label>
              <input type="password" value={pwd.currentPassword}
                onChange={(e) => setPwd((v) => ({ ...v, currentPassword: e.target.value }))}/>
            </div>
            <div className="field">
              <label>Nova senha</label>
              <input type="password" value={pwd.newPassword}
                onChange={(e) => setPwd((v) => ({ ...v, newPassword: e.target.value }))}/>
            </div>
            <div className="field">
              <label>Confirmar nova senha</label>
              <input type="password" value={pwd.confirm}
                onChange={(e) => setPwd((v) => ({ ...v, confirm: e.target.value }))}/>
            </div>
            <button className="btn btn--primary" disabled={pwdSaving}>{pwdSaving ? "Alterando..." : "Alterar senha"}</button>
            {pwdMsg && <div className="perfil-msg">{pwdMsg}</div>}
          </form>
        </section>
      </div>
    </div>
  );
}
