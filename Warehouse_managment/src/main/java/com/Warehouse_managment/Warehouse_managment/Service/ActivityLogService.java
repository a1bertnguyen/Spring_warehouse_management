package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Model.User;

import java.time.LocalDateTime;

public interface ActivityLogService {
    void log(User user, ActivityAction action, String ipAddress, String description);

    void logActivity(User user,
                     ActivityAction action,
                     String entityType,
                     Long entityId,
                     String oldValue,
                     String newValue,
                     String note,
                     String ipAddress);

    Response getAllActivityLogs();

    Response getActivityLogs(Long userId, LocalDateTime start, LocalDateTime end, int page, int size);
}
