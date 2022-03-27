package com.c3.healthapp.repository;

import com.c3.healthapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    boolean existsUserByUsername(String username);
}
