package com.c3.healthapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.Date;

import static javax.persistence.GenerationType.IDENTITY;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeartRateEntry {
    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long entryId;
    private Date dateOfEntry;
    private int entryHeartRate;

    @Override
    public String toString() {

        return "Entry Id: " + entryId + " Entry Heart Rate: " + entryHeartRate + " Date Of Entry : " + dateOfEntry;

    }
}
