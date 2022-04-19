package com.c3.healthapp.repository;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.HeartRateEntry;
import com.c3.healthapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Collection;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Customer findByUsername(String username);

    Customer findById(long id);

    //Used to prevent duplicate registrations
    boolean existsCustomerByUsername(String username);

    @Query(value = "select * from customer c where c.name like %:keyword% or c.username like %:keyword% or c.id like %:keyword%", nativeQuery = true)
    List<Customer> findByKeyword(@Param("keyword") String keyword);
}
