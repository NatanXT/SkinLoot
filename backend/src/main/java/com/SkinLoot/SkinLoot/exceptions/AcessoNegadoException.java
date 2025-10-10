package com.SkinLoot.SkinLoot.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public class AcessoNegadoException extends RuntimeException {
        public AcessoNegadoException(String message) {
            super(message);
        }
    }

