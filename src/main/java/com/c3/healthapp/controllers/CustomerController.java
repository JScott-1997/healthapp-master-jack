package com.c3.healthapp.controllers;

import com.c3.healthapp.model.*;
import com.c3.healthapp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.servlet.view.RedirectView;

import java.io.*;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
//Majority of methods return JSON data to the client. If js processing isn't required it's added to model for thymeleaf rendering
public class CustomerController {
    private final CustomerService customerService;
    private static String uploadDirectory = System.getProperty("user.dir") + "/uploads";
    //Probably best to add this in to an admin controller later, unless we want to administrate admin functions here too?
    //Might be easier to manage permissions in a /admin controller


    //adds customer to model and sends user to profile page
    @GetMapping("/profile")
    public String loggedInCustomer(Model model) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);
        model.addAttribute("customer", customer);
        return "profile";
    }

    //gets username from UsernamePasswordAuthenticationToken and passes to repo to find user details, sends json data to client
    @GetMapping("/customer")
    public ResponseEntity<Customer> getCustomer() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);

        return ResponseEntity.ok().body(customer);
    }

    @PostMapping("/save")
    public ResponseEntity<Customer> saveCustomer(@RequestBody Customer customer) {
        //returns the location the resource was created in response sent
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/save").toUriString());
        return ResponseEntity.created(uri).body(customerService.saveCustomer(customer));
    }

    @PostMapping("/role/save")
    public ResponseEntity<Role> saveRole(@RequestBody Role role) {
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/role/save").toUriString());
        return ResponseEntity.created(uri).body(customerService.saveRole(role));
    }

    @PostMapping("/units/save")
    public ResponseEntity<CustomerUnitsPreference> saveUnitPref(@RequestBody CustomerUnitsPreference customerUnitsPreference) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);
        customer.setCustomerUnitsPreference(customerUnitsPreference);
        customerService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/units/save").toUriString());
        return ResponseEntity.created(uri).body(customerUnitsPreference);
    }

    @PostMapping("/height/save")
    public ResponseEntity<Integer> saveHeight(@RequestBody int height) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);
        customer.setHeight(height);
        customerService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/height/save").toUriString());
        return ResponseEntity.created(uri).body(height);
    }


    @PostMapping("/photo/save")
    public @ResponseBody
    RedirectView savePhoto(@RequestParam("file") MultipartFile file) throws IOException {

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);

        String uploadDir = "user-photos/" + username;

        Path uploadPath = Paths.get(uploadDir);

        //Set profile picture path in customer object and save to db
        customer.setProfilePicture(fileName);
        customerService.updateCustomer(customer);

        //If directory to save files doesn't exist, create
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IOException("Could not save image file: " + fileName, e);
        }

        //Send back to profile
        return new RedirectView("../profile");
    }
}
