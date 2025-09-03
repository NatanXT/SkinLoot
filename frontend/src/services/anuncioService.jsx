import api from "./api";

const getAnuncios = () => {

    return api.get("/anuncios/")
}

const anuncioService = {
    getAnuncios,
}

likeAnuncio: (anuncioId) => {
    return api.post(`/anuncios/${anuncioId}/like`);
}

unlikeAnuncio: (anuncioId) => {
    return api.delete(`/anuncios/${anuncioId}/unlike`);
}

export default anuncioService