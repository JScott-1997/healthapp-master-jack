package com.c3.healthapp.service;

import com.c3.healthapp.model.Role;
import com.c3.healthapp.model.User;

import java.util.List;

public interface UserService {
    /**
     * Stores a new user in the database.
     *
     * @param user
     * @return The saved user
     */
    User saveUser(User user);

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
    void addRoleToUser(String username, String roleName);

    /**
     * Queries the database, retrieves the details of one specified user
     * and returns the user details as a User object.
     *
     * @param username
     * @return The specified user
     */
    User getUser(String username);

    /**
     * Queries the database, retrieves all users stored within and returns
     * the details of these users in a collection of User objects.
     *
     * @return A list of all users in the database
     */
    List<User> getUsers();

    boolean isUsernameTaken(String username);
}
