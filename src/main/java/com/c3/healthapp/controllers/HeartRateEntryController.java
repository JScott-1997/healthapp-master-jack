package com.c3.healthapp.controllers;

import com.c3.healthapp.model.HeartRateEntry;
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
@RequestMapping("/customer/heartrate")
@RequiredArgsConstructor
public class HeartRateEntryController {
    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<HeartRateEntry> saveHREntry(@RequestBody HeartRateEntry heartRateEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.saveHeartRateEntry(username, heartRateEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/heartrate/save").toUriString());
        return ResponseEntity.created(uri).body(heartRateEntry);
    }

    @PostMapping("/delete")
    public String deleteHeartRateData() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.deleteUserHeartRateData(username);
        return "customer/deleted";
    }

}
