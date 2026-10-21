package com.JavaSabados.gestor_productos.controller;

import com.JavaSabados.gestor_productos.model.Marca;
import com.JavaSabados.gestor_productos.repository.MarcaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaRepository marcaRepository;

    public MarcaController(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    @GetMapping
    public List<Marca> obtenerMarcas() {
        return marcaRepository.findAll();
    }

    @PostMapping
    public Marca crearMarca(@RequestBody Marca marca) {
        return marcaRepository.save(marca);
    }
}