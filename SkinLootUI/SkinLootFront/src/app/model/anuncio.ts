import {Usuario} from "./usuario";
import {Skin} from "./skin";
import {UUID} from "node:crypto";

export interface Anuncio{
  id: UUID;
  skin: Skin;
  vendedor: Usuario;
  preco: number;
  descricao: string;
  dataPublicacao: Date;
  status: 'DISPONIVEL' | 'VENDIDO';
}
export interface AnuncioRequest {
  titulo: string;
  descricao: string;
  preco: number;
  skinId: string;
  status?: 'ATIVO' | 'INATIVO';
}
export interface AnuncioResponse {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  status: string;
  dataCriacao: string;
  skinId: string;
  skinIcon: string;
  skinNome: string;
}
