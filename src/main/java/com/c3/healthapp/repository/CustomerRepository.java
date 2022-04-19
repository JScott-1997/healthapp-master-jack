package com.c3.healthapp.repository;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.HeartRateEntry;
import com.c3.healthapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Customer findByUsername(String username);

    //Used to prevent duplicate registrations
    boolean existsCustomerByUsername(String username);
}
