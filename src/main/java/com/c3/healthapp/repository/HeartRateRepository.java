package com.c3.healthapp.repository;

import com.c3.healthapp.model.HeartRateEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HeartRateRepository extends JpaRepository<HeartRateEntry, Long> {
}
