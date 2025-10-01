package com.SkinLoot.SkinLoot.util;

import com.SkinLoot.SkinLoot.exceptions.AcessoNegadoException;
import com.SkinLoot.SkinLoot.exceptions.LimiteExcedidoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Esta anotação torna a classe um interceptador global de exceções
public class RestExceptionHandler {

    // Este método será chamado sempre que uma AcessoNegadoException for lançada em qualquer controller
    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Object> handleAcessoNegadoException(AcessoNegadoException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", System.currentTimeMillis());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", ex.getMessage()); // A mensagem que você definiu no service!
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    // Este método será chamado sempre que uma LimiteExcedidoException for lançada
    @ExceptionHandler(LimiteExcedidoException.class)
    public ResponseEntity<Object> handleLimiteExcedidoException(LimiteExcedidoException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", System.currentTimeMillis());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", ex.getMessage()); // A mensagem que você definiu no service!
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }
}
