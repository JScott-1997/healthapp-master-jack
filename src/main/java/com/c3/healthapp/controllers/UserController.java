package com.c3.healthapp.controllers;

import com.c3.healthapp.model.Role;
import com.c3.healthapp.model.User;
import com.c3.healthapp.service.UserService;
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
import java.util.Date;

@Slf4j
@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
//Majority of methods return JSON data to the client. If js processing isn't required it's added to model for thymeleaf rendering
public class UserController {
    private final UserService userService;
    //Probably best to add this in to an admin controller later, unless we want to administrate admin functions here too?
    //Might be easier to manage permissions in a /admin controller
//    @GetMapping("/users")
//    public ResponseEntity<List<User>> getUsers() {
//        return ResponseEntity.ok().body(userService.getUsers());
//    }

    //adds user to model and sends user to profile page
    @GetMapping("/profile")
    public String loggedInUser(Model model) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        User user = userService.getUser(username);
        model.addAttribute("user", user);
        return "profile";
    }

    //gets username from UsernamePasswordAuthenticationToken and passes to repo to find user details, sends json data to client
    @GetMapping("/user")
    public ResponseEntity<User> getUser() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        User user = userService.getUser(username);
        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/save")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        //returns the location the resource was created in response sent
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveUser(user));
    }

    @PostMapping("/role/save")
    public ResponseEntity<Role> saveRole(@RequestBody Role role) {
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/user/role/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveRole(role));
    }

    //Should be added to admin functions later
//    @PostMapping("/role/add_to_user")
//    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToUserForm form) {
//        userService.addRoleToUser(form.username, form.roleName);
//        return ResponseEntity.ok().build();
//    }

}

@Data
class RoleToUserForm {
    protected String username;
    protected String roleName;
}