package com.c3.healthapp.service;

import com.c3.healthapp.model.*;

import java.util.List;

public interface CustomerService {
    /**
     * Stores a new user in the database.
     *
     * @param customer
     * @return The saved user
     */
    Customer saveCustomer(Customer customer);

    /**
     * Stores a new role in the database.
     *
     * @param role
     * @return The saved role
     */
    Role saveRole(Role role);

    /**
     * Adds a given role to a specified user.
     *
     * @param username
     * @param roleName
     */
    void addRoleToCustomer(String username, String roleName);

    /**
     * Queries the database, retrieves the details of one specified user
     * and returns the user details as a User object.
     *
     * @param username
     * @return The specified user
     */
    Customer getCustomer(String username);

    /**
     * Queries the database, retrieves all users stored within and returns
     * the details of these users in a collection of User objects.
     *
     * @return A list of all users in the database
     */
    List<Customer> getCustomers();

    boolean isUsernameTaken(String username);

    HeartRateEntry saveHeartRateEntry(String username, HeartRateEntry heartRateEntry);

    WeightEntry saveWeightEntry(String username, WeightEntry weightEntry);

}
