package com.c3.healthapp.repository;

import com.c3.healthapp.model.RespirationRateEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RespirationRateEntryRepository extends JpaRepository<RespirationRateEntry, Long> {
}
