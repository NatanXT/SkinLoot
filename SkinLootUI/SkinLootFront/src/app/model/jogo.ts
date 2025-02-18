import {UUID} from "node:crypto";

export interface Jogo{
  id: UUID,
  nome: String,
  categoria: string;
}
