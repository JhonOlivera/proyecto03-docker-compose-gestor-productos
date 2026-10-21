package com.JavaSabados.gestor_productos.repository;

import com.JavaSabados.gestor_productos.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository
        extends JpaRepository<Marca, Long> {
    }

