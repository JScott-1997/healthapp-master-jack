package com.c3.healthapp.controllers;

import com.c3.healthapp.model.*;
import com.c3.healthapp.service.CustomerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Collection;
import java.util.Date;

@Slf4j
@Controller
@RequestMapping("/customer")
@RequiredArgsConstructor
//Majority of methods return JSON data to the client. If js processing isn't required it's added to model for thymeleaf rendering
public class CustomerController {
    private final CustomerService customerService;
    //Probably best to add this in to an admin controller later, unless we want to administrate admin functions here too?
    //Might be easier to manage permissions in a /admin controller
//    @GetMapping("/users")
//    public ResponseEntity<List<User>> getUsers() {
//        return ResponseEntity.ok().body(userService.getUsers());
//    }

    //adds user to model and sends user to profile page
    @GetMapping("/profile")
    public String loggedInCustomer(Model model) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        User user = customerService.getCustomer(username);
        model.addAttribute("user", user);
        return "profile";
    }

    //gets username from UsernamePasswordAuthenticationToken and passes to repo to find user details, sends json data to client
    @GetMapping("/customer")
    public ResponseEntity<Customer> getCustomer() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        System.out.println(username);
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

    //Should be added to admin functions later
//    @PostMapping("/role/add_to_user")
//    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToUserForm form) {
//        userService.addRoleToUser(form.username, form.roleName);
//        return ResponseEntity.ok().build();
//    }

    @PostMapping("/heartrates/save")
    public ResponseEntity<HeartRateEntry> saveHREntry(@RequestBody HeartRateEntry heartRateEntry){
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        customerService.saveHeartRateEntry(username, heartRateEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/heartrates/save").toUriString());
        return ResponseEntity.created(uri).body(heartRateEntry);
    }

    @PostMapping("/weight/save")
    public ResponseEntity<WeightEntry> saveHREntry(@RequestBody WeightEntry weightEntry){
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        customerService.saveWeightEntry(username, weightEntry);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/weight/save").toUriString());
        return ResponseEntity.created(uri).body(weightEntry);
    }

    @PostMapping("/units/save")
    public ResponseEntity<CustomerUnitsPreference> saveUnitPref(@RequestBody CustomerUnitsPreference customerUnitsPreference){
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = customerService.getCustomer(username);
        customer.setCustomerUnitsPreference(customerUnitsPreference);
        customerService.saveCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/units/save").toUriString());
        return ResponseEntity.created(uri).body(customerUnitsPreference);
    }

}

@Data
class RoleToCustomerForm {
    protected String username;
    protected String roleName;
}