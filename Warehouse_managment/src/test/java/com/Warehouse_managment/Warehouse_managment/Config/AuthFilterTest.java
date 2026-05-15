package com.Warehouse_managment.Warehouse_managment.Config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthFilterTest {

    private JwtUtils jwtUtils;
    private CustomUserDetailsService customUserDetailsService;
    private AuthFilter authFilter;

    @BeforeEach
    void setUp() {
        jwtUtils = mock(JwtUtils.class);
        customUserDetailsService = mock(CustomUserDetailsService.class);
        authFilter = new AuthFilter(jwtUtils, customUserDetailsService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldSkipSwaggerUiRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/swagger-ui/index.html");

        assertThat(authFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void shouldSkipOpenApiDocsRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v3/api-docs/swagger-config");

        assertThat(authFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void shouldSkipLoginRequests() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");

        assertThat(authFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void invalidJwtDoesNotBreakProtectedRequest() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/users");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();
        request.addHeader("Authorization", "Bearer invalid-token");

        when(jwtUtils.getUsernameFromToken("invalid-token"))
                .thenThrow(new RuntimeException("JWT expired"));

        authFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
