package com.SkinLoot.SkinLoot.controler;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/bitskins")
public class BitSkinsRedirectController {

    @GetMapping("/redirect")
    public ResponseEntity<Void> redirecionarParaBitSkins(@RequestParam String skinName) {
        try {
            String encodedName = URLEncoder.encode(skinName, StandardCharsets.UTF_8);
            String url = "https://bitskins.com/market/?name=" + encodedName;

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(url));
            return new ResponseEntity<>(headers, HttpStatus.FOUND); // HTTP 302
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
