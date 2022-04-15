package com.c3.healthapp.service;

import com.c3.healthapp.model.*;
import com.c3.healthapp.repository.*;
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
public class CustomerServiceImplementation implements CustomerService, UserDetailsService {
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final HeartRateRepository heartRateRepository;
    private final WeightEntryRepository weightEntryRepository;
    private final GripStrengthEntryRepository gripStrengthEntryRepository;
    private final RespirationRateEntryRepository respirationRateEntryRepository;
    private final BCryptPasswordEncoder pwEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByUsername(username);
        if (customer == null) {
            log.error("User {} not found in the database", username);
            throw new UsernameNotFoundException("User not found in the database");
        } else {
            log.info("User {} found in the database", username);
        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        customer.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        });
        return new org.springframework.security.core.userdetails.User(username, customer.getPassword(), authorities);
    }

    /**
     * Stores a new user in the database.
     *
     * @param customer
     * @return The saved user
     */
    @Override
    public Customer saveCustomer(Customer customer) {
        System.out.println(customer.getPassword());
        customer.setPassword(pwEncoder.encode(customer.getPassword()));
        System.out.println(customer.getPassword());
        log.info("Saving new user: {} to the database...", customer.getUsername());
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        log.info("Saving new user: {} to the database...", customer.getUsername());
        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Customer customer) {
        log.info("Removing customer: {} and their associated data...", customer.getUsername());
        customerRepository.delete(customer);
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
    public void addRoleToCustomer(String username, String roleName) {
        log.info("Adding role: {} to user {}...", roleName, username);
        Customer customer = customerRepository.findByUsername(username);
        Role role = roleRepository.findByName(roleName);
        customer.getRoles().add(role);
    }

    /**
     * Queries the database, retrieves the details of one specified user
     * and returns the user details as a User object.
     *
     * @param username
     * @return The specified user
     */
    @Override
    public Customer getCustomer(String username) {
        log.info("Fetching user {}...", username);
        return customerRepository.findByUsername(username);
    }

    /**
     * Queries the database, retrieves all users stored within and returns
     * the details of these users in a collection of User objects.
     *
     * @return A list of all users in the database
     */
    @Override
    public List<Customer> getCustomers() {
        log.info("Fetching all users...");
        return customerRepository.findAll();
    }

    @Override
    public HeartRateEntry saveHeartRateEntry(String username, HeartRateEntry heartRateEntry) {
        log.info("Saving new heart rate entry to the database for user: {}...", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getHeartRateEntries().add(heartRateEntry);
        return heartRateRepository.save(heartRateEntry);
    }

    @Override
    public WeightEntry saveWeightEntry(String username, WeightEntry weightEntry) {
        log.info("Saving new weight entry to the database for user: {}...", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getWeightEntries().add(weightEntry);
        return weightEntryRepository.save(weightEntry);
    }

    @Override
    public GripStrengthEntry saveGripStrengthEntry(String username, GripStrengthEntry gripStrengthEntry) {
        log.info("Saving new grip strength entry to the database for user: {}...", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getGripStrengthEntries().add(gripStrengthEntry);
        return gripStrengthEntryRepository.save(gripStrengthEntry);
    }

    @Override
    public RespirationRateEntry saveRespirationRateEntry(String username, RespirationRateEntry respirationRateEntry) {
        log.info("Saving new respiration rate entry to the database for user: {}...", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getRespirationRateEntries().add(respirationRateEntry);
        return respirationRateEntryRepository.save(respirationRateEntry);
    }

    public boolean isUsernameTaken(String username) {
        return customerRepository.existsCustomerByUsername(username);
    }
}
