package com.c3.healthapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//Maps HTML pages to paths
@Configuration
public class ViewConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/login").setViewName("login");
        registry.addViewController("/register").setViewName("register");
        registry.addViewController("/user/dashboard").setViewName("dashboard");
        registry.addViewController("/user/weight").setViewName("weight");
        registry.addViewController("/user/heartrate").setViewName("heartrate");
    }
}
