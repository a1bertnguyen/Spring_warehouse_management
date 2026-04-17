package com.Warehouse_managment.Warehouse_managment.Model;

import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "activity_logs",
        indexes = {
                @Index(name = "idx_activity_logs_user_created_at", columnList = "user_id,timestamp"),
                @Index(name = "idx_activity_logs_domain_reference", columnList = "domain,reference_type,reference_id")
        }
)
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

    @Enumerated(EnumType.STRING)
    @Column(name = "domain", nullable = false, length = 50)
    private ActivityDomain domain;

    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "before_state", columnDefinition = "JSON")
    private String beforeState;

    @Column(name = "after_state", columnDefinition = "JSON")
    private String afterState;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

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
                ", domain=" + domain +
                ", referenceType='" + referenceType + '\'' +
                ", referenceId=" + referenceId +
                ", beforeState='" + beforeState + '\'' +
                ", afterState='" + afterState + '\'' +
                ", metadata='" + metadata + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", note='" + note + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
