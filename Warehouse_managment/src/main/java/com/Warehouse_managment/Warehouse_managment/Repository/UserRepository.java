package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query(value = "SELECT * FROM users WHERE role = 'MANAGER' ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<User> findRandomManagerUser();
    Optional<User> findByResetToken(String resetToken);
}
