package com.c3.healthapp.config.controllers;

import com.c3.healthapp.model.*;
import com.c3.healthapp.service.UserService;
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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
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
//Most methods return JSON data to the client. If js processing isn't required it's added to model for thymeleaf rendering
public class CustomerController {
    private final UserService userService;
    private static String uploadDirectory = System.getProperty("user.dir") + "/uploads";

    @GetMapping(value={"/dashboard", "/"})
    public String home(Model model){
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        model.addAttribute("customer", customer);
        return "customer/dashboard";
    }

    //adds customer to model and sends user to profile page
    @GetMapping("/profile")
    public String profile(Model model) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        model.addAttribute("customer", customer);
        return "customer/profile";
    }

    @GetMapping("/settings")
    public String settings(Model model){
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        model.addAttribute("customer", customer);
        return "customer/settings";
    }

    //gets username from UsernamePasswordAuthenticationToken and passes to repo to find user details, sends json data to client
    @GetMapping("/customer")
    public ResponseEntity<Customer> getCustomer() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);

        return ResponseEntity.ok().body(customer);
    }

    @PostMapping("/save")
    public ResponseEntity<Customer> saveCustomer(@RequestBody Customer customer) {
        //returns the location the resource was created in response sent
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveCustomer(customer));
    }

    @PostMapping("/role/save")
    public ResponseEntity<Role> saveRole(@RequestBody Role role) {
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/role/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveRole(role));
    }

    @PostMapping("/units/save")
    public ResponseEntity<CustomerUnitsPreference> saveUnitPref(@RequestBody CustomerUnitsPreference customerUnitsPreference) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        customer.setCustomerUnitsPreference(customerUnitsPreference);
        userService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/units/save").toUriString());
        return ResponseEntity.created(uri).body(customerUnitsPreference);
    }

    @PostMapping("/height/save")
    public ResponseEntity<Integer> saveHeight(@RequestBody int height) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);
        customer.setHeight(height);
        userService.updateCustomer(customer);
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/height/save").toUriString());
        return ResponseEntity.created(uri).body(height);
    }


    @PostMapping("/photo/save")
    public @ResponseBody
    RedirectView savePhoto(@RequestParam("file") MultipartFile file) throws IOException {

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        //Throw error if non image file uploaded
        String fileExt = fileName.split("\\.")[1];
        System.out.println(fileExt);
        if(!fileExt.equals("jpg") || fileExt.equals("png")){
            throw new IOException("Invalid File Type: " + fileExt);
        }
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        Customer customer = userService.getCustomer(username);

        String uploadDir = "user-photos/" + username;

        Path uploadPath = Paths.get(uploadDir);
        //Set profile picture path in customer object and save to db
        customer.setProfilePicture(fileName);
        userService.updateCustomer(customer);

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

    @PostMapping("/update")
    public String updateFeaturesEnabled(@ModelAttribute RolesForCustomer rolesForCustomer, @RequestParam String username, Model model) {
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
        return "customer/settings";
    }

    @PostMapping("/account/delete")
    public String deleteAccount(Model model, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        userService.deleteCustomer(userService.getCustomer(username));
        HttpSession session = request.getSession();
        session.invalidate();
        model.addAttribute("username", username);
        return "deleted";
    }
}
