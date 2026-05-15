package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Config.AuthFilter;
import com.Warehouse_managment.Warehouse_managment.Config.CustomUserDetailsService;
import com.Warehouse_managment.Warehouse_managment.Config.JwtUtils;
import com.Warehouse_managment.Warehouse_managment.Config.SecurityConfig;
import com.Warehouse_managment.Warehouse_managment.Dtos.LoginRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.RegisterRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.CustomAccessDenialHandler;
import com.Warehouse_managment.Warehouse_managment.Exceptions.CustomAuthenticationEntryPoint;
import com.Warehouse_managment.Warehouse_managment.Service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        AuthFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDenialHandler.class
})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loginAllowsAnonymousUsers() throws Exception {
        when(userService.loginUser(any(LoginRequest.class), any(HttpServletRequest.class)))
                .thenReturn(Response.builder().status(200).token("token").message("ok").build());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@example.com", "secret"))))
                .andExpect(status().isOk());
    }

    @Test
    void registerAllowsAnonymousUsers() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("New User", "new@example.com", "Password@123", "0900000000", null);
        when(userService.registerUser(eq(registerRequest)))
                .thenReturn(Response.builder().status(200).message("created").build());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void registerAllowsAdmins() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("New User", "new@example.com", "Password@123", "0900000000", null);
        when(userService.registerUser(eq(registerRequest)))
                .thenReturn(Response.builder().status(200).message("created").build());

        mockMvc.perform(post("/api/auth/register")
                        .with(user("admin").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());
    }
}
