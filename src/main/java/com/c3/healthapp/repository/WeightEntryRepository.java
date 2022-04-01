package com.c3.healthapp.repository;

import com.c3.healthapp.model.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, Long> {
}
