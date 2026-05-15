package com.Warehouse_managment.Warehouse_managment.Config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenApiConfigTest {

    @Test
    void keepsBearerSchemeWithoutGlobalSecurityRequirement() {
        OpenAPI openAPI = new OpenApiConfig().warehouseManagementOpenAPI();

        assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("bearerAuth");
        assertThat(openAPI.getSecurity()).isNullOrEmpty();
    }
}
