// Serviços para Perfil/Minha Conta
import { api } from "./api";

// Busca perfil
export async function getMyProfile() {
  const { data } = await api.get("/users/me");
  return data;
}

// Atualiza perfil básico (ajuste conforme seu DTO no Spring)
export async function updateMyProfile(payload) {
  const { data } = await api.put("/users/me", payload);
  return data;
}

// Troca de senha (payload: { currentPassword, newPassword })
export async function changeMyPassword(payload) {
  const { data } = await api.put("/users/me/password", payload);
  return data;
}
