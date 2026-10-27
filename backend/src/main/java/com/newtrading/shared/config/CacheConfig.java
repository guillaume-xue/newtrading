package com.newtrading.shared.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_STOCK_HISTORY = "stockHistory";
    public static final String CACHE_STOCK_QUOTE = "stockQuote";

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();

        // 1. Cache Historique : Données immuables clôturées -> TTL long (24h), taille modérée
        CaffeineCache historyCache = new CaffeineCache(
                CACHE_STOCK_HISTORY,
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(Duration.ofHours(24))
                        .recordStats()
                        .build()
        );

        // 2. Cache Cotations en direct : Prix instantané -> TTL très court (10s), haute capacité
        CaffeineCache quoteCache = new CaffeineCache(
                CACHE_STOCK_QUOTE,
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(Duration.ofSeconds(10))
                        .recordStats()
                        .build()
        );

        cacheManager.setCaches(List.of(historyCache, quoteCache));
        return cacheManager;
    }
}
