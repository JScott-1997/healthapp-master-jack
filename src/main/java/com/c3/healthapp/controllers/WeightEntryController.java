package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.WeightEntry;
import com.c3.healthapp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Slf4j
@Controller
@RequestMapping("/customer/weight")
@RequiredArgsConstructor
public class WeightEntryController {
    private final CustomerService customerService;

    @PostMapping("/save")
    public ResponseEntity<WeightEntry> saveHREntry(@RequestBody WeightEntry weightEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        customerService.saveWeightEntry(username, weightEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/weight/save").toUriString());
        return ResponseEntity.created(uri).body(weightEntry);
    }

    @PostMapping("/target/save")
    public ResponseEntity<Integer> saveWeightTarget(@RequestBody int targetWeight) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);
        customer.setTargetWeight(targetWeight);
        customerService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/weight/target/save").toUriString());
        return ResponseEntity.created(uri).body(targetWeight);
    }
}
