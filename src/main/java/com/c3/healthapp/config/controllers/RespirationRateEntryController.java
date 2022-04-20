package com.c3.healthapp.config.controllers;

import com.c3.healthapp.model.RespirationRateEntry;
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
@RequestMapping("/customer/respirationrate")
@RequiredArgsConstructor
public class RespirationRateEntryController {
    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<RespirationRateEntry> saveHREntry(@RequestBody RespirationRateEntry respirationRateEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.saveRespirationRateEntry(username, respirationRateEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/respirationrate/save").toUriString());
        return ResponseEntity.created(uri).body(respirationRateEntry);
    }

    @PostMapping("/delete")
    public String deleteRespirationData() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.deleteUserRespirationData(username);
        return "customer/deleted";
    }
}
