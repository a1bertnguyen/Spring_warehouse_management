package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Config.AuthFilter;
import com.Warehouse_managment.Warehouse_managment.Config.CustomUserDetailsService;
import com.Warehouse_managment.Warehouse_managment.Config.JwtUtils;
import com.Warehouse_managment.Warehouse_managment.Config.SecurityConfig;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.UserDTO;
import com.Warehouse_managment.Warehouse_managment.Service.UserService;
import com.Warehouse_managment.Warehouse_managment.Exceptions.CustomAccessDenialHandler;
import com.Warehouse_managment.Warehouse_managment.Exceptions.CustomAuthenticationEntryPoint;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({
        SecurityConfig.class,
        AuthFilter.class,
        CustomAuthenticationEntryPoint.class,
        CustomAccessDenialHandler.class
})
class UserControllerSecurityTest {

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
    void updateRejectsNonAdminUsers() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("User One");

        mockMvc.perform(put("/api/users/update/5")
                        .with(user("manager").authorities(new SimpleGrantedAuthority("MANAGER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateAllowsAdmins() throws Exception {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("User One");
        userDTO.setPassword("NewPassword@123");

        when(userService.updateUser(eq(5L), any(UserDTO.class)))
                .thenReturn(Response.builder().status(200).message("updated").build());

        mockMvc.perform(put("/api/users/update/5")
                        .with(user("admin").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDTO)))
                .andExpect(status().isOk());
    }
}
