package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.CustomerUnitsPreference;
import com.c3.healthapp.model.Role;
import com.c3.healthapp.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/registration")
@RequiredArgsConstructor
public class CustomerRegistrationController {

    private final UserService userService;

    @PostMapping
    //As data will be passed as a string in post request, ModelAttribute is used to bind data to customer object
    public String registerCustomer(@ModelAttribute Customer customer, @ModelAttribute RolesForCustomer rolesForCustomer, Model model) {
        model.addAttribute("username", customer.getUsername());
        System.out.println(customer.getPassword());
        //Check if user exists and save, redirect
        if (!userService.isUsernameTaken(customer.getUsername())) {
            //Units preference is metric by default, can be changed in settings when logged in
            customer.setCustomerUnitsPreference(CustomerUnitsPreference.METRIC);

            userService.saveCustomer(customer);

            //All users have this role
            userService.addRoleToCustomer(customer.getUsername(), "ROLE_USER");
            //Add roles from register form
            for (String userRole : rolesForCustomer.getSubmittedRoles()) {
                userService.addRoleToCustomer(customer.getUsername(), userRole);
            }
            return "success";
        } else {
            return "exists";
        }
    }
}

