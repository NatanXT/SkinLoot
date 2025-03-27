import {UUID} from "node:crypto";
import {Usuario} from "./usuario";
import {Jogo} from "./jogo";

export interface Skin{
  id: UUID;
  nome: string;
  imagem: string,
  raridade: string;
  jogo: Jogo;
  //usuario: Usuario;
}
