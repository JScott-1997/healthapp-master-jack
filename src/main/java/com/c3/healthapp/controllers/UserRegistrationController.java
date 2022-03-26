package com.c3.healthapp.controllers;

import com.c3.healthapp.model.User;
import com.c3.healthapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/registration")
@RequiredArgsConstructor
public class UserRegistrationController {

    private final UserService userService;

    @PostMapping
    //As data will be passed as a string in post request, ModelAttribute is used to bind data to user object
    public String registerUser(@ModelAttribute User user, Model model){
        model.addAttribute("username", user.getUsername());
        userService.saveUser(user);

        //All users start with this role
        userService.addRoleToUser(user.getUsername(), "ROLE_USER");
        return "success";
    }
}

