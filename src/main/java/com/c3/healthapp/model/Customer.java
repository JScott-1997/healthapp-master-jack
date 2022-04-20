package com.c3.healthapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.springframework.data.annotation.Transient;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import java.lang.reflect.Field;
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
    private double targetWeight;
    private double targetGripStrength;
    private CustomerSex customerSex;
    private CustomerUnitsPreference customerUnitsPreference;
    private String profilePicture;

    @ManyToMany(cascade= {CascadeType.PERSIST, CascadeType.REMOVE})
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<HeartRateEntry> heartRateEntries = new ArrayList<>();
    @ManyToMany(cascade= {CascadeType.PERSIST, CascadeType.REMOVE})
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<WeightEntry> weightEntries = new ArrayList<>();
    @ManyToMany(cascade= {CascadeType.PERSIST, CascadeType.REMOVE})
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<GripStrengthEntry> gripStrengthEntries = new ArrayList<>();
    @ManyToMany(cascade= {CascadeType.PERSIST, CascadeType.REMOVE})
    @LazyCollection(LazyCollectionOption.FALSE)
    private Collection<RespirationRateEntry> respirationRateEntries = new ArrayList<>();

    @Transient
    public String getProfilePicturePath() {
        if (profilePicture == null || getId() == null) return null;

        return "/user-photos/" + getUsername() + "/" + profilePicture;
    }

    /**
     * Fill current object fields with new object values, ignoring new NULLs. Old values are overwritten.
     *
     * @param newObject Same type object with new values.
     */
    public void merge(Object newObject) {

        assert this.getClass().getName().equals(newObject.getClass().getName());

        for (Field field : this.getClass().getDeclaredFields()) {

            for (Field newField : newObject.getClass().getDeclaredFields()) {

                if (field.getName().equals(newField.getName())) {

                    try {

                        field.set(
                                this,
                                newField.get(newObject) == null
                                        ? field.get(this)
                                        : newField.get(newObject));

                    } catch (IllegalAccessException ignore) {
                        // Field update exception on final modifier and other cases.
                    }
                }
            }
        }
    }

}
