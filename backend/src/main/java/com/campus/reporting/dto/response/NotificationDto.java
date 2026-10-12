package com.campus.reporting.dto.response;

import java.time.OffsetDateTime;

public class NotificationDto {

    private Long id;
    private Long complaintId;
    private String title;
    private String message;
    private boolean read;
    private String notificationType;
    private OffsetDateTime createdAt;

    public NotificationDto() {}

    public NotificationDto(Long id, Long complaintId, String title, String message, boolean read, String notificationType, OffsetDateTime createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.title = title;
        this.message = message;
        this.read = read;
        this.notificationType = notificationType;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
