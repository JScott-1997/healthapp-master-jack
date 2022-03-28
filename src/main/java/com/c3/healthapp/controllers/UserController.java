package com.c3.healthapp.controllers;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.c3.healthapp.model.Role;
import com.c3.healthapp.model.User;
import com.c3.healthapp.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Slf4j
@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    //Probably best to add this in to an admin controller later, unless we want to administrate admin functions here too?
    //Might be easier to manage permissions in a /admin controller
//    @GetMapping("/users")
//    public ResponseEntity<List<User>> getUsers() {
//        return ResponseEntity.ok().body(userService.getUsers());
//    }

    //adds user to model and loads profile page
    @GetMapping("/profile")
    public String loggedInUser(Model model) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        User user = userService.getUser(username);
        System.out.println(user);
        model.addAttribute("user", user);
        return "profile";
    }

    @GetMapping("/user")
    public ResponseEntity<User> getUser() {
        String username = SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal().toString();
        User user = userService.getUser(username);
        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/user/save")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        //returns the location the resource was created in response sent
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/controller/user/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveUser(user));
    }

    @PostMapping("/role/save")
    public ResponseEntity<Role> saveRole(@RequestBody Role role) {
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/controller/role/save").toUriString());
        return ResponseEntity.created(uri).body(userService.saveRole(role));
    }

    @PostMapping("/role/add_to_user")
    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToUserForm form) {
        userService.addRoleToUser(form.username, form.roleName);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/token/refresh")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authorizationHeader = request.getHeader(AUTHORIZATION);
        System.out.println("Auth: " + request.getHeader("Authorization"));
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                String refreshToken = authorizationHeader.substring("Bearer ".length());
                Algorithm algorithm = Algorithm.HMAC256("secret".getBytes());
                JWTVerifier verifier = JWT.require(algorithm).build();
                DecodedJWT decodedJWT = verifier.verify(refreshToken);
                String username = decodedJWT.getSubject();
                User user = userService.getUser(username);

                String accessToken = JWT.create()
                        .withSubject(user.getUsername())
                        .withExpiresAt(new Date(System.currentTimeMillis() + 30 * 60 * 1000))
                        .withIssuer(request.getRequestURL().toString())
                        .withClaim("roles", user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                        .sign(algorithm);

                Map<String, String> tokens = new HashMap<>();
                tokens.put("access_token", accessToken);
                tokens.put("refresh_token", refreshToken);
                response.setContentType(APPLICATION_JSON_VALUE);
                new ObjectMapper().writeValue(response.getOutputStream(), tokens);
            } catch (Exception exception) {
                log.error("Error logging in: {}", exception.getMessage());
                response.setHeader("error", exception.getMessage());
                response.setStatus(FORBIDDEN.value());
                Map<String, String> error = new HashMap<>();
                error.put("error_message", exception.getMessage());
                response.setContentType(APPLICATION_JSON_VALUE);
                new ObjectMapper().writeValue(response.getOutputStream(), error);
            }
        } else {
            throw new RuntimeException("Refresh token is missing");
        }

    }

}


@Data
class RoleToUserForm {
    protected String username;
    protected String roleName;
}