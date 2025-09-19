//package com.SkinLoot.SkinLoot.service;
//
//import com.SkinLoot.SkinLoot.dto.OfertaSkinDto;
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.ParameterizedTypeReference;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//
//@Service
//public class BitSkinsClient {
//
//    @Value("${bitskins.api.key}")
//    private String apiKey;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public List<OfertaSkinDto> buscarSkinsPopulares() {
//        String url = "https://api.bitskins.com/market/insell/730";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("x-apikey", apiKey);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//
//        ResponseEntity<String> response = restTemplate.exchange(
//                url,
//                HttpMethod.GET,
//                entity,
//                String.class
//        );
//
//        List<OfertaSkinDto> lista = new ArrayList<>();
//
//        try {
//            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                ObjectMapper mapper = new ObjectMapper();
//
//                // 🧠 Agora sabemos que o JSON tem o campo "list"
//                Map<String, Object> root = mapper.readValue(response.getBody(), new TypeReference<>() {});
//                Object listObj = root.get("list");
//
//                if (listObj instanceof List<?> items) {
//                    for (Object obj : items) {
//                        if (obj instanceof Map<?, ?> item) {
//                            OfertaSkinDto dto = new OfertaSkinDto(
//                                    (String) item.get("name"),
//                                    Double.parseDouble(item.get("price_min").toString()) / 100.0,
//                                    Double.parseDouble(item.get("price_max").toString()) / 100.0,
//                                    Double.parseDouble(item.get("price_avg").toString()) / 100.0,
//                                    String.valueOf(item.get("skin_id")),
//                                    Integer.parseInt(item.get("quantity").toString())
//                            );
//                            lista.add(dto);
//                        }
//                    }
//                } else {
//                    System.out.println("⚠️ Campo 'list' não é uma lista. Tipo: " + (listObj != null ? listObj.getClass() : "null"));
//                }
//            }
//        } catch (Exception e) {
//            System.out.println("❌ Erro ao processar JSON da BitSkins: " + e.getMessage());
//            e.printStackTrace();
//        }
//
//        return lista;
//    }
//
//
//
//
//}
