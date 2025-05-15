import {UUID} from "node:crypto";
import {Usuario} from "./usuario";
import {Jogo} from "./jogo";

export interface Skin{
  // id: UUID;
  // nome: string;
  // imagem: string,
  // raridade: string;
  // jogo: Jogo;
   nome: string;
   descricao: string;
   raridade: string;
   jogoNome: string;
   icon: string;
   assetId: string;
   desgasteFloat: number;
   qualidade: string;
   Jogo: Jogo
   Usuario: Usuario;
}
export interface SkinRequest {
  nome: string;
  descricao: string;
  raridade: string;
  jogoNome: string;
  icon: string;
  assetId?: string;
  desgasteFloat?: number;
  qualidade?: string;
}
