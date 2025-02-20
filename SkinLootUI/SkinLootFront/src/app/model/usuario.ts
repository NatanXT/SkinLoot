import {UUID} from "node:crypto";
import {Skin} from "./skin";

export interface Usuario {
  id: UUID;
  nome: String;
  email: String;
  senha: String;
  skins: Skin[];
}
export interface LoginCredentials {
  email: string;
  senha: string;
}
export interface LoginResponse{
  user: Usuario;
  token: string;
}
