import {UUID} from "node:crypto";
import {Skin} from "./skin";

export interface Usuario {
  id: number;
  nome: String;
  genero: string;
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
export interface RegisterRequest {
  nome: string;
  genero: string;
  email: string;
  senha: string;
}
