// ==========================================================
// CarrosselSkins.jsx
// ----------------------------------------------------------
// Componente que renderiza um carrossel automático de skins
// (com agrupamento dinâmico e autoplay pausável).
// Utiliza Swiper.js com módulos de Autoplay, Pagination e Fade.
// ==========================================================

import React, { useRef } from 'react';
import '../home/CarrosselSkins.css';
import { Swiper, SwiperSlide } from 'swiper/react';

// Estilos e módulos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

/**
 * Renderiza um carrossel com skins organizadas em grupos de 4.
 * O autoplay pausa quando o usuário passa o mouse sobre o carrossel.
 *
 * @param {Array} skins - Lista de objetos contendo { nome, imagemUrl }.
 */
export default function CarrosselSkins({ skins }) {
  const swiperRef = useRef(null);

  /**
   * Agrupa uma lista em subarrays de tamanho fixo.
   * Ex: groupSkins([1,2,3,4,5], 2) -> [[1,2],[3,4],[5]]
   */
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
        slidesPerView={1}
        spaceBetween={20}
        loop
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ clickable: true, el: '.swiper-pagination-container' }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
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
                    src={skin.imagemUrl || '/img/placeholder.png'}
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

      {/* Container de paginação do Swiper */}
      <div className="swiper-pagination-container"></div>
    </section>
  );
}
