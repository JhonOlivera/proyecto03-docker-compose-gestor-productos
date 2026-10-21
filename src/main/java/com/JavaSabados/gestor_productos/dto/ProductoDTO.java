package com.JavaSabados.gestor_productos.dto;

import com.JavaSabados.gestor_productos.model.Producto;

public class ProductoDTO {
    private Long id;
    private String nombre;
    private double precio;
    private int stock;
    private String categoria;
    private String marca;

    public ProductoDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
        this.categoria = producto.getCategoria() != null
                ? producto.getCategoria().getNombre() : null;
        this.marca = producto.getMarca() != null
                ? producto.getMarca().getNombre() : null;
    }

    // metodos accesores de todos los campos

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }
}