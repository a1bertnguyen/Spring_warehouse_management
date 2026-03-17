package com.Warehouse_managment.Warehouse_managment.Dtos;



import com.Warehouse_managment.Warehouse_managment.Enum.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "phoneNumber is required")
    private String phoneNumber;

    private UserRole role;

}
