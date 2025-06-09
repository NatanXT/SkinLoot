import {UUID} from "node:crypto";
import {Usuario} from "./usuario";
import {Jogo} from "./jogo";

export interface Skin{
   id: bigint;
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
   Usuario: Usuario;
}
export interface SkinRequest {
  nome: string;
  descricao: string;
  raridade: string;
  jogoId: UUID;
  icon: string;
  assetId?: string;
  desgasteFloat?: number;
  qualidade?: string;
}
export interface OfertaSkinCS2{
  name: string;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  skinId: string;
  quantity: number;
}
