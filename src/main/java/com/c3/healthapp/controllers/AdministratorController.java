package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.service.CustomerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdministratorController {
    private final CustomerService customerService;

    @PostMapping("/add_to_user")
    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToCustomerForm form) {
        customerService.addRoleToCustomer(form.username, form.roleName);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user_administration")
    public ResponseEntity<List<Customer>> getUsers() {
        return ResponseEntity.ok().body(customerService.getCustomers());
    }
}

@Data
class RoleToCustomerForm {
    protected String username;
    protected String roleName;
}