package com.c3.healthapp.service;

import com.c3.healthapp.model.Role;
import com.c3.healthapp.model.User;
import com.c3.healthapp.repository.RoleRepository;
import com.c3.healthapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImplementation implements UserService, UserDetailsService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder pwEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.error("User {} not found in the database", username);
            throw new UsernameNotFoundException("User not found in the database");
        } else {
            log.info("User {} found in the database", username);
        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        });
        return new org.springframework.security.core.userdetails.User(username, user.getPassword(), authorities);
    }

    /**
     * Stores a new user in the database.
     *
     * @param user
     * @return The saved user
     */
    @Override
    public User saveUser(User user) {
        user.setPassword(pwEncoder.encode(user.getPassword()));
        log.info("Saving new user: {} to the database...", user.getUsername());
        return userRepository.save(user);
    }

    /**
     * Stores a new role in the database.
     *
     * @param role
     * @return The saved role
     */
    @Override
    public Role saveRole(Role role) {
        log.info("Saving new role: {} to the database...", role.getName());
        return roleRepository.save(role);
    }

    /**
     * Adds a given role to a specified user.
     *
     * @param username
     * @param roleName
     */
    @Override
    public void addRoleToUser(String username, String roleName) {
        log.info("Adding role: {} to user {}...", roleName, username);
        User user = userRepository.findByUsername(username);
        Role role = roleRepository.findByName(roleName);
        user.getRoles().add(role);
    }

    /**
     * Queries the database, retrieves the details of one specified user
     * and returns the user details as a User object.
     *
     * @param username
     * @return The specified user
     */
    @Override
    public User getUser(String username) {
        log.info("Fetching user {}...", username);
        return userRepository.findByUsername(username);
    }

    /**
     * Queries the database, retrieves all users stored within and returns
     * the details of these users in a collection of User objects.
     *
     * @return A list of all users in the database
     */
    @Override
    public List<User> getUsers() {
        log.info("Fetching all users...");
        return userRepository.findAll();
    }
}
