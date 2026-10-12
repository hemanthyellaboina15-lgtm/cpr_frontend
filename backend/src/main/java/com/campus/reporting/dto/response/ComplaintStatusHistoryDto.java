package com.campus.reporting.dto.response;

import java.time.OffsetDateTime;

public class ComplaintStatusHistoryDto {

    private Long id;
    private Long complaintId;
    private String previousStatus;
    private String newStatus;
    private String actionType;
    private String notes;
    private String performedByName;
    private String performedByRole;
    private String assignedDepartmentName;
    private String assignedStaffName;
    private OffsetDateTime createdAt;

    public ComplaintStatusHistoryDto() {}

    public ComplaintStatusHistoryDto(Long id, Long complaintId, String previousStatus, String newStatus, String actionType, String notes, String performedByName, String performedByRole, String assignedDepartmentName, String assignedStaffName, OffsetDateTime createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actionType = actionType;
        this.notes = notes;
        this.performedByName = performedByName;
        this.performedByRole = performedByRole;
        this.assignedDepartmentName = assignedDepartmentName;
        this.assignedStaffName = assignedStaffName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }

    public String getPerformedByRole() { return performedByRole; }
    public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }

    public String getAssignedDepartmentName() { return assignedDepartmentName; }
    public void setAssignedDepartmentName(String assignedDepartmentName) { this.assignedDepartmentName = assignedDepartmentName; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
