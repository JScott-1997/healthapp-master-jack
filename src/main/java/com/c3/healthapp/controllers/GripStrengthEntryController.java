package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.GripStrengthEntry;
import com.c3.healthapp.service.UserService;
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
@RequestMapping("/customer/gripstrength")
@RequiredArgsConstructor
public class GripStrengthEntryController {
    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<GripStrengthEntry> saveGSEntry(@RequestBody GripStrengthEntry gripStrengthEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.saveGripStrengthEntry(username, gripStrengthEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/gripstrength/save").toUriString());
        return ResponseEntity.created(uri).body(gripStrengthEntry);
    }

    @PostMapping("/target/save")
    public ResponseEntity<Double> saveGripTarget(@RequestBody double gripStrengthTarget) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        customer.setTargetGripStrength(gripStrengthTarget);
        userService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/gripstrength/target/save").toUriString());
        return ResponseEntity.created(uri).body(gripStrengthTarget);
    }

    @PostMapping("/delete")
    public String deleteGripStrengthData() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.deleteUserGripStrengthData(username);
        return "customer/deleted";
    }
}
