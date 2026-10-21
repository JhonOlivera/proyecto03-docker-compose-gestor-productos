package com.JavaSabados.gestor_productos.service;

import com.JavaSabados.gestor_productos.model.Marca;
import com.JavaSabados.gestor_productos.repository.MarcaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<Marca> listarMarcas() {
        return marcaRepository.findAll();
    }

    public Marca agregarMarca(Marca marca) {
        return marcaRepository.save(marca);
    }
}