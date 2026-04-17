package com.Warehouse_managment.Warehouse_managment.Service;


import com.Warehouse_managment.Warehouse_managment.Dtos.LoginRequest;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Dtos.RegisterRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.UserDTO;
import jakarta.servlet.http.HttpServletRequest;

public interface UserService {
    Response registerUser(RegisterRequest registerRequest);

    Response loginUser(LoginRequest loginRequest, HttpServletRequest request);

    Response logoutUser(HttpServletRequest request);

    Response getAllUsers();

    User getCurrentLoggedInUser();

    Response getUserById(Long id);

    Response updateUser(Long id, UserDTO userDTO);

    Response deleteUser(Long id);

    String forgotPassword(String email);

    void resetPassword(String token, String newPassword);
}
