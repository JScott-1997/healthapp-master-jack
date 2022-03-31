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
@RequestMapping("/user/heart-rate")
@RequiredArgsConstructor
public class HeartRateEntryController {

    private final UserService userService;

    @PostMapping("/user/heart-rate/save")
    public ResponseEntity<HeartRateEntry> saveUserHeartRateEntry(@RequestBody HeartRateEntry heartRateEntry) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/controller/user/heart-rate/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveHeartRateEntry(username, heartRateEntry));
    }

}
