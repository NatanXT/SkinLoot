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
