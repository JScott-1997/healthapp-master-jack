package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.User;
import com.c3.healthapp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/registration")
@RequiredArgsConstructor
public class CustomerRegistrationController {

    private final CustomerService customerService;

    @PostMapping
    //As data will be passed as a string in post request, ModelAttribute is used to bind data to customer object
    public String registerCustomer(@ModelAttribute Customer customer, Model model) {
        model.addAttribute("username", customer.getUsername());
        System.out.println(customer.getPassword());
        //Check if user exists and save, redirect
        if (!customerService.isUsernameTaken(customer.getUsername())) {
            //All users start with this role
            customerService.saveCustomer(customer);
            customerService.addRoleToCustomer(customer.getUsername(), "ROLE_USER");
            return "success";
        } else {
            return "exists";
        }
    }
}

