package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.ActivityLogDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Model.ActivityLog;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Repository.ActivityLogRepository;
import com.Warehouse_managment.Warehouse_managment.Service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(User user, ActivityAction action, String ipAddress, String description) {
        logActivity(user, action, "AUTH", user.getId(), null, null, description, ipAddress);
    }

    @Override
    public void logActivity(User user,
                            ActivityAction action,
                            String entityType,
                            Long entityId,
                            String oldValue,
                            String newValue,
                            String note,
                            String ipAddress) {
        activityLogRepository.save(ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .note(note)
                .build());
    }

    @Override
    public Response getAllActivityLogs() {
        List<ActivityLogDTO> activityLogs = activityLogRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt", "id"))
                .stream()
                .map(this::mapToDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .data(activityLogs)
                .build();
    }

    @Override
    public Response getActivityLogs(Long id, LocalDateTime start, LocalDateTime end, int page, int size) {
        Page<ActivityLogDTO> activityLogs = activityLogRepository
                .findByUserAndDate(
                        id,
                        start,
                        end,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"))
                )
                .map(this::mapToDto);

        return Response.builder()
                .status(200)
                .message("success")
                .data(activityLogs.getContent())
                .meta(Response.Meta.builder()
                        .totalPages(activityLogs.getTotalPages())
                        .totalElements(activityLogs.getTotalElements())
                        .build())
                .build();
    }

    private ActivityLogDTO mapToDto(ActivityLog activityLog) {
        User user = activityLog.getUser();

        return new ActivityLogDTO(
                activityLog.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                activityLog.getAction(),
                activityLog.getEntityType(),
                activityLog.getEntityId(),
                activityLog.getOldValue(),
                activityLog.getNewValue(),
                activityLog.getIpAddress(),
                activityLog.getNote(),
                activityLog.getCreatedAt()
        );
    }
}
