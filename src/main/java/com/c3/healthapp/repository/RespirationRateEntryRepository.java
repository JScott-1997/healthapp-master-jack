package com.c3.healthapp.repository;

import com.c3.healthapp.model.RespirationRateEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespirationRateEntryRepository extends JpaRepository<RespirationRateEntry, Long> {
    void deleteByEntryId(List<Long> customerRespirationEntryIds);
}
