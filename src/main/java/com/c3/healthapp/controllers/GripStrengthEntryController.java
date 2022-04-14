package com.c3.healthapp.controllers;

import com.c3.healthapp.model.GripStrengthEntry;
import com.c3.healthapp.model.HeartRateEntry;
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
@RequestMapping("/customer/gripstrength")
@RequiredArgsConstructor
public class GripStrengthEntryController {
    private final CustomerService customerService;

    @PostMapping("/save")
    public ResponseEntity<GripStrengthEntry> saveGSEntry(@RequestBody GripStrengthEntry gripStrengthEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        customerService.saveGripStrengthEntry(username, gripStrengthEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/gripstrength/save").toUriString());
        return ResponseEntity.created(uri).body(gripStrengthEntry);
    }
}
