package com.Warehouse_managment.Warehouse_managment.Model;

import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActivityAction action;

    @Column(length = 50)
    private String entityType;

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    private String ipAddress;

    @Column(length = 255)
    private String note;

    @Builder.Default
    @Column(name = "timestamp")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Override
    public String toString() {
        return "ActivityLog{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", action=" + action +
                ", entityType='" + entityType + '\'' +
                ", entityId=" + entityId +
                ", oldValue='" + oldValue + '\'' +
                ", newValue='" + newValue + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", note='" + note + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
