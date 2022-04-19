package com.c3.healthapp.repository;

import com.c3.healthapp.model.GripStrengthEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GripStrengthEntryRepository extends JpaRepository<GripStrengthEntry, Long> {
    void deleteByEntryIdIn(List<Long> customerRespirationEntryIds);
}
