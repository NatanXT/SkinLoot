import api from './api';

/**
 * Busca a lista de todos os jogos disponíveis no banco de dados.
 * (Requer um endpoint no backend, ex: GET /api/jogos)
 *
 * @returns {Promise<Array<{id: string, nome: string}>>} Uma lista de jogos.
 */
export const listarJogos = async () => {
    try {
        // Vamos assumir que seu endpoint de jogos está em '/api/jogos'
        const { data } = await api.get('/jogos');

        // Garante que sempre retornará um array
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Falha ao buscar a lista de jogos:", error);
        // Retorna um array vazio em caso de erro para não quebrar a UI
        return [];
    }
};

const jogoService = {
    listarJogos,
};

export default jogoService;
