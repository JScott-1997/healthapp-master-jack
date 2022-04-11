package com.c3.healthapp.repository;

import com.c3.healthapp.model.GripStrengthEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GripStrengthEntryRepository extends JpaRepository<GripStrengthEntry, Long> {
}
