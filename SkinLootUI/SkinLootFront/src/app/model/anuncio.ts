import {Usuario} from "./usuario";
import {Skin} from "./skin";

export interface Anuncio{
  id: number;
  skin: Skin;
  // vendedor: Usuario;
  preco: number;
  descricao: string;
  dataPublicacao: Date;
  status: 'DISPONIVEL' | 'VENDIDO';
}
