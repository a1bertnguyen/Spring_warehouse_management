package com.Warehouse_managment.Warehouse_managment.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticAssetConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path productImageDirectory = resolveProductImageDirectory();
        Path legacyProductImageDirectory = resolveLegacyProductImageDirectory();
        String productImageLocation = productImageDirectory.toUri().toString();
        String legacyProductImageLocation = legacyProductImageDirectory.toUri().toString();

        registry.addResourceHandler("/assets/products/**")
                .addResourceLocations(productImageLocation, legacyProductImageLocation);

        registry.addResourceHandler("/images/products/**")
                .addResourceLocations(productImageLocation, legacyProductImageLocation);
    }

    private Path resolveProductImageDirectory() {
        Path currentPath = Paths.get(System.getProperty("user.dir"));

        if (currentPath.endsWith("backend")) {
            currentPath = currentPath.getParent();
        }

        return currentPath.resolve("product-images").toAbsolutePath().normalize();
    }

    private Path resolveLegacyProductImageDirectory() {
        Path currentPath = Paths.get(System.getProperty("user.dir"));

        if (currentPath.endsWith("backend")) {
            currentPath = currentPath.getParent();
        }

        return currentPath.resolve("warehouse-app")
                .resolve("src")
                .resolve("assets")
                .resolve("products")
                .toAbsolutePath()
                .normalize();
    }
}
