package com.c3.healthapp.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Date;
import java.util.stream.Collectors;


@Slf4j
public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private AuthenticationManager manager;

    public CustomAuthenticationFilter(AuthenticationManager authenticationManager) {
        this.manager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password);
        return manager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User) authResult.getPrincipal();
        //Secret used for demo purposes, more secure secret used in production
        Algorithm algo = Algorithm.HMAC256("secret".getBytes());
        String access_token = JWT.create()
                .withSubject(user.getUsername())
                //Access token is valid for 10 minutes
                .withExpiresAt(new Date(System.currentTimeMillis() + 10 * 60 * 1000))
                .withIssuer(request.getRequestURL().toString())
                //Add user roles to access token
                .withClaim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList())).sign(algo);

        String refresh_token = JWT.create()
                .withSubject(user.getUsername())
                //Refresh token valid for 30 minutes
                .withExpiresAt(new Date(System.currentTimeMillis() + 30 * 60 * 1000))
                .withIssuer(request.getRequestURL().toString())
                //Add user roles to refresh token
                .withClaim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList())).sign(algo);

        //Create cookies to contain access and refresh token and add them to response
        Cookie accessTokenCookie = new Cookie("token", access_token);
        //httpOnly is secure as doesn't allow client scripts to access cookie, however is still sent in http requests
        accessTokenCookie.setHttpOnly(true);
        //should be set to true in production, means https is required, however development server is http
        accessTokenCookie.setSecure(false);
        //setPath is used to define the directories the cookie is valid within
        accessTokenCookie.setPath("/");
        response.addCookie(accessTokenCookie);
        Cookie refreshTokenCookie = new Cookie("refreshToken", refresh_token);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setPath("/");
        response.addCookie(refreshTokenCookie);

        //Redirect to dashboard on authentication success
        String redirectUrl = "/user/dashboard";
        new DefaultRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }


    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException {
        //pass error param back to login page to display username pw not found message
        String redirectUrl = "/login?error";
        new DefaultRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
