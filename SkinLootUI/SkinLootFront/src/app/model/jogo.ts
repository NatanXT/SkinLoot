import {UUID} from "node:crypto";
import {Skin} from "./skin";

export interface Jogo{
  id: UUID,
  nome: String,
  categoria: string;
  skins: Skin[];
}
