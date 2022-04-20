package com.c3.healthapp.config.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.WeightEntry;
import com.c3.healthapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Slf4j
@Controller
@RequestMapping("/customer/weight")
@RequiredArgsConstructor
public class WeightEntryController {
    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<WeightEntry> saveHREntry(@RequestBody WeightEntry weightEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.saveWeightEntry(username, weightEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/weight/save").toUriString());
        return ResponseEntity.created(uri).body(weightEntry);
    }

    @PostMapping("/target/save")
    public ResponseEntity<Double> saveWeightTarget(@RequestBody double targetWeight) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        customer.setTargetWeight(targetWeight);
        userService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/weight/target/save").toUriString());
        return ResponseEntity.created(uri).body(targetWeight);
    }

    @PostMapping("/delete")
    public String deleteWeightData() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.deleteUserWeightData(username);
        return "customer/deleted";
    }
}
