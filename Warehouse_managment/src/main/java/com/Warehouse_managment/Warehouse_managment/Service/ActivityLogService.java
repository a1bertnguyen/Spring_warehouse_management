package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityDomain;
import com.Warehouse_managment.Warehouse_managment.Model.User;

import java.time.LocalDateTime;

public interface ActivityLogService {
    void log(User user, ActivityAction action, String ipAddress, String description);

    void logActivity(User user,
                     ActivityAction action,
                     ActivityDomain domain,
                     String referenceType,
                     Long referenceId,
                     Object beforeState,
                     Object afterState,
                     Object metadata,
                     String note,
                     String ipAddress);

    Response getAllActivityLogs();

    Response getActivityLogs(Long userId, LocalDateTime start, LocalDateTime end, int page, int size);
}
