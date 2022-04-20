package com.c3.healthapp.service;

import com.c3.healthapp.model.*;
import com.c3.healthapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@Primary
public class UserServiceImplementation implements UserService, UserDetailsService {
    private final CustomerRepository customerRepository;
    private final AdministratorRepository administratorRepository;
    private final RoleRepository roleRepository;
    private final HeartRateRepository heartRateRepository;
    private final WeightEntryRepository weightEntryRepository;
    private final GripStrengthEntryRepository gripStrengthEntryRepository;
    private final RespirationRateEntryRepository respirationRateEntryRepository;
    private final BCryptPasswordEncoder pwEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = customerRepository.findByUsername(username);
        if (user == null) {
            user = administratorRepository.findAdministratorByUsername(username);
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
     * @param customer
     * @return The saved user
     */
    @Override
    public Customer saveCustomer(Customer customer) {
        customer.setPassword(pwEncoder.encode(customer.getPassword()));
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
        customer.getRoles().clear();
        customer.getRespirationRateEntries().clear();
        customer.getGripStrengthEntries().clear();
        customer.getWeightEntries().clear();
        customer.getHeartRateEntries().clear();
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

    @Override
    public Customer getCustomer(long id) {
        return customerRepository.findById(id);
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
    public List<Customer> getByKeyword(String keyword){
        return customerRepository.findByKeyword(keyword);
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

    //Checks both admin and customer tables for username, usernames must be unique
    public boolean isUsernameTaken(String username) {
        return customerRepository.existsCustomerByUsername(username) || administratorRepository.existsAdministratorByUsername(username);
    }

    @Override
    public void deleteUserData(String username) {
        log.info("Deleting the All Health data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        List<Long> customerEntryIds = customer.getRespirationRateEntries().stream().map(RespirationRateEntry :: getEntryId).collect(Collectors.toList());
        respirationRateEntryRepository.deleteByEntryIdIn(customerEntryIds);
        customer.getRespirationRateEntries().clear();

        customerEntryIds = customer.getGripStrengthEntries().stream().map(GripStrengthEntry :: getEntryId).collect(Collectors.toList());
        gripStrengthEntryRepository.deleteByEntryIdIn(customerEntryIds);
        customer.getGripStrengthEntries().clear();

        customerEntryIds = customer.getHeartRateEntries().stream().map(HeartRateEntry :: getEntryId).collect(Collectors.toList());
        heartRateRepository.deleteByEntryIdIn(customerEntryIds);
        customer.getHeartRateEntries().clear();

        customerEntryIds = customer.getWeightEntries().stream().map(WeightEntry :: getEntryId).collect(Collectors.toList());
        weightEntryRepository.deleteByEntryIdIn(customerEntryIds);
        customer.getWeightEntries().clear();
    }

    @Override
    public void deleteUserRespirationData(String username) {
        log.info("Deleting the Respiration data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        List<Long> customerRespirationEntryIds = customer.getRespirationRateEntries().stream().map(RespirationRateEntry :: getEntryId).collect(Collectors.toList());
        respirationRateEntryRepository.deleteByEntryIdIn(customerRespirationEntryIds);
        customer.getRespirationRateEntries().clear();
    }

    @Override
    public void deleteUserGripStrengthData(String username) {
        log.info("Deleting the Grip data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        List<Long> customerGripEntryIds = customer.getGripStrengthEntries().stream().map(GripStrengthEntry :: getEntryId).collect(Collectors.toList());
        gripStrengthEntryRepository.deleteByEntryIdIn(customerGripEntryIds);
        customer.getGripStrengthEntries().clear();
    }

    @Override
    public void deleteUserHeartRateData(String username) {
        log.info("Deleting the Heart data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        List<Long> customerHeartEntryIds = customer.getHeartRateEntries().stream().map(HeartRateEntry :: getEntryId).collect(Collectors.toList());
        heartRateRepository.deleteByEntryIdIn(customerHeartEntryIds);
        customer.getHeartRateEntries().clear();
    }

    @Override
    public void deleteUserWeightData(String username) {
        log.info("Deleting the Weight data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        List<Long> customerWeightEntryIds = customer.getWeightEntries().stream().map(WeightEntry :: getEntryId).collect(Collectors.toList());
        weightEntryRepository.deleteByEntryIdIn(customerWeightEntryIds);
        customer.getWeightEntries().clear();
    }
}
