package com.c3.healthapp.controllers;

import com.c3.healthapp.model.HeartRateEntry;
import com.c3.healthapp.model.RespirationRateEntry;
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
@RequestMapping("/customer/respiration_rate")
@RequiredArgsConstructor
public class RespirationRateEntryController {
    private final CustomerService customerService;

    @PostMapping("/customer/respiration_rate/save")
    public ResponseEntity<RespirationRateEntry> saveHREntry(@RequestBody RespirationRateEntry respirationRateEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        customerService.saveRespirationRateEntry(username, respirationRateEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/respiration_rate/save").toUriString());
        return ResponseEntity.created(uri).body(respirationRateEntry);
    }
}
