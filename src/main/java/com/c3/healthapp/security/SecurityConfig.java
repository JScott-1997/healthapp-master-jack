package com.c3.healthapp.security;

import com.c3.healthapp.filter.CustomAuthenticationFilter;
import com.c3.healthapp.filter.CustomAuthorizationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;

@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(bCryptPasswordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        //Disable session based security
        http.csrf().disable();

        //set login page (with unauthenticated parameter), invalidate cookies and session on /logout
        http.formLogin().loginPage("/login?unauthenticated")
                .defaultSuccessUrl("/user/dashboard", true)
                .permitAll().and().httpBasic().and().logout().logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout").deleteCookies("token").deleteCookies("refreshToken").invalidateHttpSession(true);
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        http.authorizeRequests().antMatchers(GET, "/user/**").hasAuthority("ROLE_USER");
        http.authorizeRequests().antMatchers(POST, "/user/save/**").hasAuthority("ROLE_ADMIN");
        http.authorizeRequests().antMatchers(GET, "/admin/**").hasAuthority("ROLE_ADMIN");
        http.authorizeRequests().antMatchers("/**", "/login/**", "/").permitAll();
        http.addFilterBefore(new CustomAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class);
        http.addFilter(new CustomAuthenticationFilter(authenticationManagerBean()));
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}