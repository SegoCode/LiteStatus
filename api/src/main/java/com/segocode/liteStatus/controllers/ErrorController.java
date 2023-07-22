package com.segocode.liteStatus.controllers;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

// @RestController es una anotación que indica que esta clase es un controlador y que
// puede manejar solicitudes web. Spring creará una instancia de esta clase y la gestionará.
@RestController
public class ErrorController implements org.springframework.boot.web.servlet.error.ErrorController {

    // Estás declarando una variable de instancia 'errorAttributes' que es una instancia de la
    // interfaz ErrorAttributes. La palabra clave 'final' indica que la referencia a este objeto
    // no puede cambiar una vez que se ha inicializado.
    private final ErrorAttributes errorAttributes;

    // Este es un constructor para la clase ErrorController. La anotación @Autowired no es necesaria
    // aquí debido al comportamiento predeterminado de la inyección de dependencias en Spring Boot,
    // que inyecta automáticamente las dependencias en los constructores con un solo parámetro.
    // El objeto ErrorAttributes será proporcionado automáticamente por el contenedor de Spring.
    public ErrorController(ErrorAttributes errorAttributes) {
        this.errorAttributes = errorAttributes;
    }

    // @RequestMapping es una anotación que mapea solicitudes HTTP a los métodos del controlador.
    // En este caso, cualquier solicitud a la ruta "/error" será manejada por este método.
    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(WebRequest webRequest) {
        // Creas un nuevo mapa para almacenar los detalles del error.
        Map<String, Object> errorDetails = new HashMap<>();
        // Usas la instancia de errorAttributes para obtener los detalles del error de la solicitud actual.
        Map<String, Object> errorAttributesData = this.errorAttributes.getErrorAttributes(webRequest, ErrorAttributeOptions.defaults());

        // Llenas el mapa de errorDetails con los detalles del error.
        errorDetails.put("timestamp", ZonedDateTime.now().format(DateTimeFormatter.ISO_INSTANT));
        errorDetails.put("status", errorAttributesData.get("status"));
        errorDetails.put("error", errorAttributesData.get("error"));
        errorDetails.put("path", errorAttributesData.get("path"));

        // Conviertes el código de estado que obtuviste en un objeto HttpStatus, para poder
        // devolverlo en la respuesta.
        HttpStatus status = HttpStatus.valueOf((Integer) errorAttributesData.get("status"));

        // Finalmente, devuelves una nueva instancia de ResponseEntity. Esto incluye los detalles del
        // error como cuerpo de la respuesta y el código de estado HTTP como estado de la respuesta.
        return new ResponseEntity<>(errorDetails, status);
    }
}