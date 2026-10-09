package com.newtrading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class NewTradingApplication {
    public static void main(String[] args) {
        SpringApplication.run(NewTradingApplication.class, args);
    }
}
