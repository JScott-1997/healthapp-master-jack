package com.c3.healthapp.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@Slf4j
public class CustomAuthorizationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (request.getServletPath() == "/login") {
            filterChain.doFilter(request, response);
        } else {
            try {
                String authToken = tokenExtractor(request, "token");
                Algorithm algo = Algorithm.HMAC256("secret".getBytes());
                JWTVerifier verifier = JWT.require(algo).build();
                DecodedJWT decodedJWT;
                try {
                    decodedJWT = verifier.verify(authToken);

                    //To refresh access token if expired and refresh token is still valid
                } catch (Exception e) {

                    //Read refreshToken and verify
                    String refreshToken = tokenExtractor(request, "refreshToken");
                    decodedJWT = verifier.verify(refreshToken);

                    //Get new access token
                    authToken = refreshAccessToken(decodedJWT, request, response);
                    decodedJWT = verifier.verify(authToken);
                }
                //Set authorities based on roles from JWT
                String username = decodedJWT.getSubject();
                String[] roles = decodedJWT.getClaim("roles").asArray(String.class);
                Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                Arrays.stream(roles).forEach(r -> {
                    authorities.add(new SimpleGrantedAuthority(r));
                });

                //Credentials are null as they're not needed after auth has been completed
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                filterChain.doFilter(request, response);
            } catch (Exception e) {
                filterChain.doFilter(request, response);
            }
        }
    }

    private String tokenExtractor(HttpServletRequest request, String tokenType) {
        Cookie cookie = WebUtils.getCookie(request, tokenType);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    //Called when current access token is invalid, takes refresh token as input
    private String refreshAccessToken(DecodedJWT jwt, HttpServletRequest request, HttpServletResponse response) {
        Algorithm algo = Algorithm.HMAC256("secret".getBytes());
        String accessToken = JWT.create()
                .withSubject(jwt.getSubject())
                .withExpiresAt(new Date(System.currentTimeMillis() + 10 * 60 * 1000))
                .withIssuer(request.getRequestURL().toString())
                .withClaim("roles", stream(jwt.getClaim("roles").asArray(String.class)).collect(Collectors.toList()))
                .sign(algo);

        //Add new cookie to response
        Cookie accessTokenCookie = new Cookie("token", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(false);
        accessTokenCookie.setPath("/");
        response.addCookie(accessTokenCookie);

        return accessToken;
    }
}