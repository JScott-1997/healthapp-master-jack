package com.c3.healthapp;

import com.c3.healthapp.model.Role;
import com.c3.healthapp.model.User;
import com.c3.healthapp.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.ArrayList;

@SpringBootApplication
public class HealthappApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthappApplication.class, args);
    }

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    }
