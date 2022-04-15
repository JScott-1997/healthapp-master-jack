package com.c3.healthapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.springframework.data.annotation.Transient;

import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Collection;

@Entity
@DynamicUpdate
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Customer extends User {

    private Date dateOfBirth;
    private int height;
    private int targetWeight;
    private CustomerSex customerSex;
    private CustomerUnitsPreference customerUnitsPreference;
    private String profilePicture;

    @ManyToMany
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<HeartRateEntry> heartRateEntries = new ArrayList<>();
    @ManyToMany
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<WeightEntry> weightEntries = new ArrayList<>();
    @ManyToMany
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<GripStrengthEntry> gripStrengthEntries = new ArrayList<>();
    @ManyToMany
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<RespirationRateEntry> respirationRateEntries = new ArrayList<>();

    @Transient
    public String getProfilePicturePath() {
        if (profilePicture == null || getId() == null) return null;

        return "/user-photos/" + getUsername() + "/" + profilePicture;
    }

}
