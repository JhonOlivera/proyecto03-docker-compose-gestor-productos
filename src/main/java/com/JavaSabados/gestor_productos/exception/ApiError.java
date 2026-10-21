package com.JavaSabados.gestor_productos.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiError {

    private int status;
    private String mensaje;
    private Map<String, String> errores;
    private String timestamp;

    public ApiError(int status, String mensaje, Map<String, String> errores) {
        this.status = status;
        this.mensaje = mensaje;
        this.errores = errores;
        this.timestamp = LocalDateTime.now().toString();
    }

    public int getStatus(){ return status; }
    public String getMensaje(){ return mensaje; }
    public Map<String, String> getErrores(){ return errores; }
    public String getTimestamp(){ return timestamp; }
}