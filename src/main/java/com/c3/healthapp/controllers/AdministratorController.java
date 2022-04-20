package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Customer;
import com.c3.healthapp.model.Role;
import com.c3.healthapp.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdministratorController {
    private final UserService userService;

    @PostMapping("/add_to_user")
    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToCustomerForm form) {
        userService.addRoleToCustomer(form.username, form.roleName);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user_administration")
    public ResponseEntity<List<Customer>> getUsers() {
        return ResponseEntity.ok().body(userService.getCustomers());
    }

    @GetMapping("/search")
    public String search(Model model, String keyword) {
        if (keyword != null) {
            List<Customer> list = userService.getByKeyword(keyword);
            model.addAttribute("customers", list);
        } else {
            List<Customer> list = userService.getCustomers();
            model.addAttribute("customers", list);
        }
        return "admin/viewusers";
    }

    @GetMapping("/customer")
    public String getCustomer(Model model, @RequestParam long id) {
        Customer customer = userService.getCustomer(id);
        model.addAttribute("customer", customer);
        return "admin/edituser";
    }

    @PostMapping("/customer/weight/delete")
    public String deleteCustomerWeightData(@RequestParam String username) {
        userService.deleteUserWeightData(username);
        return "admin/deleted";
    }

    @PostMapping("/customer/heartrate/delete")
    public String deleteCustomerHRData(@RequestParam String username) {
        userService.deleteUserHeartRateData(username);
        return "admin/deleted";
    }

    @PostMapping("/customer/respiration/delete")
    public String deleteCustomerRespirationData(@RequestParam String username) {
        userService.deleteUserRespirationData(username);
        return "admin/deleted";
    }

    @PostMapping("/customer/gripstrength/delete")
    public String deleteCustomerGripStrengthData(@RequestParam String username) {
        userService.deleteUserGripStrengthData(username);
        return "admin/deleted";
    }

    @PostMapping("/customer/account/delete")
    public String deleteCustomerAccount(@RequestParam String username) {
        Customer customer = userService.getCustomer(username);
        userService.deleteCustomer(customer);
        return "admin/deleted";
    }

    @PostMapping("/customer/update")
    public String updateCustomerRoles(@ModelAttribute RolesForCustomer rolesForCustomer, @RequestParam String username, Model model) {
        //Get user and clear all previous roles, re-add user role
        Customer customer = userService.getCustomer(username);
        customer.getRoles().clear();
        Role userRole = new Role(1L, "ROLE_USER");
        customer.getRoles().add(userRole);
        userService.updateCustomer(customer);
        if (rolesForCustomer != null && rolesForCustomer.submittedRoles != null) {
            //For each role from checkbox, add to customer, then add customer back into model and redirect to confirmation page
            for (String roleString : rolesForCustomer.getSubmittedRoles()) {
                if (roleString != null)
                    userService.addRoleToCustomer(username, roleString);
            }
        }
        customer = userService.getCustomer(username);
        model.addAttribute("customer", customer);
        return "admin/updatedcustomer";
    }
}

@Data
class RoleToCustomerForm {
    protected String username;
    protected String roleName;
}

@Data
class RolesForCustomer {
    protected ArrayList<String> submittedRoles;
}