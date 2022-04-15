package com.c3.healthapp.service;

import com.c3.healthapp.model.Administrator;
import com.c3.healthapp.model.Customer;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AdministratorServiceImplementation implements AdministratorService, UserDetailsService {
    private final AdministratorRepository administratorRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final HeartRateRepository heartRateRepository;
    private final WeightEntryRepository weightEntryRepository;
    private final GripStrengthEntryRepository gripStrengthEntryRepository;
    private final RespirationRateEntryRepository respirationRateEntryRepository;
    private final BCryptPasswordEncoder pwEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Administrator administrator = administratorRepository.findAdministratorByUsername(username);
        if (administrator == null) {
            log.error("Administrator {} not found in the database", username);
            throw new UsernameNotFoundException("Administrator not found in the database");
        } else {
            log.info("Administrator {} found in the database", username);
        }
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        administrator.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        });
        return new org.springframework.security.core.userdetails.User(username, administrator.getPassword(), authorities);
    }

    @Override
    public void deleteUserData(String username) {
    }

    @Override
    public void deleteUserRespirationData(String username) {
        log.info("Deleting the Health data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
    }

    @Override
    public void deleteUserGripStrengthData(String username) {
        log.info("Deleting the Health data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getGripStrengthEntries().clear();
    }

    @Override
    public void deleteUserHeartRateData(String username) {
        log.info("Deleting the Health data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getHeartRateEntries().clear();
    }

    @Override
    public void deleteUserWeightData(String username) {
        log.info("Deleting the Health data of Customer: {}", username);
        Customer customer = customerRepository.findByUsername(username);
        customer.getWeightEntries().clear();
    }
}
