package com.JavaSabados.gestor_productos.dto;

public class AuthResponse {
    //atributo
    private String token;
    public AuthResponse(String token){
    this.token=token;
}
    public String getToken() {
    return token;
}
}
