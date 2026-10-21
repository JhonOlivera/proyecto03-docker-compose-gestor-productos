package com.JavaSabados.gestor_productos.repository;

import com.JavaSabados.gestor_productos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {
}
