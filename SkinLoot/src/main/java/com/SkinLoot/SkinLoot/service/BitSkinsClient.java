package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.OfertaSkinDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BitSkinsClient {

    @Value("${bitskins.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<OfertaSkinDto> buscarSkinsPopulares() {
        String url = "https://api.bitskins.com/market/insell/730";

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apikey", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        List<OfertaSkinDto> lista = new ArrayList<>();

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();

            Object dataObj = body.get("data");
            if (dataObj instanceof Map dataMap) {
                Object itemsObj = dataMap.get("items");

                if (itemsObj instanceof List<?> items) {
                    for (Object obj : items) {
                        if (obj instanceof Map<?, ?> item) {
                            OfertaSkinDto dto = new OfertaSkinDto(
                                    (String) item.get("name"),
                                    Double.parseDouble(item.get("price_min").toString()) / 100.0,
                                    Double.parseDouble(item.get("price_max").toString()) / 100.0,
                                    Double.parseDouble(item.get("price_avg").toString()) / 100.0,
                                    String.valueOf(item.get("skin_id")),
                                    Integer.parseInt(item.get("quantity").toString())
                            );
                            lista.add(dto);
                        }
                    }
                } else {
                    System.out.println("⚠️ Campo 'items' dentro de 'data' não é uma lista.");
                }
            } else {
                System.out.println("⚠️ Campo 'data' não é um objeto.");
            }
        }

        return lista;
    }


}
