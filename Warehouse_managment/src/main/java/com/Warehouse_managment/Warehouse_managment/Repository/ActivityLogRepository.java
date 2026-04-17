package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    @Query("""
            SELECT a FROM ActivityLog a
            WHERE (:userId IS NULL OR a.user.id = :userId)
            AND (:start IS NULL OR a.createdAt >= :start)
            AND (:end IS NULL OR a.createdAt <= :end)
            """)
    Page<ActivityLog> findByUserAndDate(@Param("userId") Long userId,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end,
                                        Pageable pageable);
}
