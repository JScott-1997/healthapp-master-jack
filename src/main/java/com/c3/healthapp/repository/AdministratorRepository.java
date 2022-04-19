package com.c3.healthapp.repository;

import com.c3.healthapp.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    Administrator findAdministratorByUsername(String username);

    //Used to prevent duplicate registrations
    boolean existsAdministratorByUsername(String username);
}
