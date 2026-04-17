package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.ActivityLogDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityDomain;
import com.Warehouse_managment.Warehouse_managment.Model.ActivityLog;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Repository.ActivityLogRepository;
import com.Warehouse_managment.Warehouse_managment.Service.ActivityLogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void log(User user, ActivityAction action, String ipAddress, String description) {
        logActivity(
                user,
                action,
                ActivityDomain.AUTH,
                "USER",
                user.getId(),
                null,
                null,
                Map.of("description", description),
                description,
                ipAddress
        );
    }

    @Override
    public void logActivity(User user,
                            ActivityAction action,
                            ActivityDomain domain,
                            String referenceType,
                            Long referenceId,
                            Object beforeState,
                            Object afterState,
                            Object metadata,
                            String note,
                            String ipAddress) {
        activityLogRepository.save(ActivityLog.builder()
                .user(user)
                .action(action)
                .domain(domain)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .beforeState(toJson(beforeState))
                .afterState(toJson(afterState))
                .metadata(toJson(metadata))
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
                activityLog.getDomain(),
                activityLog.getReferenceType(),
                activityLog.getReferenceId(),
                activityLog.getBeforeState(),
                activityLog.getAfterState(),
                activityLog.getMetadata(),
                activityLog.getReferenceType(),
                activityLog.getReferenceId(),
                activityLog.getBeforeState(),
                activityLog.getAfterState(),
                activityLog.getIpAddress(),
                activityLog.getNote(),
                activityLog.getCreatedAt()
        );
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            if (value instanceof String raw) {
                String trimmed = raw.trim();
                if (trimmed.isEmpty()) {
                    return null;
                }
                try {
                    Object parsed = objectMapper.readValue(trimmed, Object.class);
                    return objectMapper.writeValueAsString(parsed);
                } catch (JsonProcessingException ignored) {
                    return objectMapper.writeValueAsString(Map.of("value", raw));
                }
            }

            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize activity log payload", exception);
        }
    }
}
