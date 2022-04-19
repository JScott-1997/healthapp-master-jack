package com.c3.healthapp.repository;

import com.c3.healthapp.model.HeartRateEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeartRateRepository extends JpaRepository<HeartRateEntry, Long> {
    void deleteByEntryIdIn(List<Long> customerHeartEntryIds);
}
