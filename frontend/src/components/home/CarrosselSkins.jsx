// CarrosselSkins.jsx
import React, { useRef } from "react";
import "../../styles/home/CarrosselSkins.css";
import { Swiper, SwiperSlide } from "swiper/react";

// Estilos do Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";

// Módulos do Swiper
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

/**
 * Componente que renderiza um carrossel automático de skins em grupos de 4.
 * Pausa o autoplay ao passar o mouse e reinicia ao sair.
 * 
 * @param {Array} skins - Lista de objetos de skin com `nome` e `imagemUrl`.
 */
export default function CarrosselSkins({ skins }) {
  const swiperRef = useRef(null);

  // Agrupa as skins em subarrays de tamanho `size`
  const groupSkins = (list, size) => {
    const grouped = [];
    for (let i = 0; i < list.length; i += size) {
      grouped.push(list.slice(i, i + size));
    }
    return grouped;
  };

  const groupedSkins = groupSkins(skins, 4);

  return (
    <section className="cards-section">
      <h2>Populares</h2>

      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={20}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ clickable: true, el: ".swiper-pagination-container" }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        onSwiper={(swiper) => { swiperRef.current = swiper }}
      >
        {groupedSkins.map((group, index) => (
          <SwiperSlide
            key={index}
            onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => swiperRef.current?.autoplay?.start()}
          >
            <div className="cards-grid">
              {group.map((skin, i) => (
                <div className="card" key={i}>
                  <img
                    src={skin.imagemUrl || "/img/placeholder.png"}
                    alt={skin.nome}
                  />
                  <div className="card-info">
                    <span>{skin.nome}</span>
                    <button>Ver mais</button>
                  </div>
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="swiper-pagination-container"></div>
    </section>
  );
}
