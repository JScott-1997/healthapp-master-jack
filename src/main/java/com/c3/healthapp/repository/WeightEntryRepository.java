package com.c3.healthapp.repository;

import com.c3.healthapp.model.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, Long> {
    void deleteByEntryId(List<Long> customerWeightEntryIds);
}
