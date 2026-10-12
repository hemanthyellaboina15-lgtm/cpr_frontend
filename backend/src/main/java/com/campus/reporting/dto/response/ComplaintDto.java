package com.campus.reporting.dto.response;

import com.campus.reporting.entity.ComplaintStatus;
import com.campus.reporting.entity.Priority;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class ComplaintDto {

    private Long id;
    private String referenceNo;
    private String title;
    private String description;
    private String category;
    private String location;
    private Priority priority;
    private ComplaintStatus status;
    private UserDto student;
    private DepartmentDto department;
    private UserDto assignedStaff;
    private String resolutionNotes;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<ComplaintAttachmentDto> attachments = new ArrayList<>();
    private List<ComplaintStatusHistoryDto> statusHistory = new ArrayList<>();

    public ComplaintDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public UserDto getStudent() { return student; }
    public void setStudent(UserDto student) { this.student = student; }

    public DepartmentDto getDepartment() { return department; }
    public void setDepartment(DepartmentDto department) { this.department = department; }

    public UserDto getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(UserDto assignedStaff) { this.assignedStaff = assignedStaff; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public OffsetDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(OffsetDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ComplaintAttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<ComplaintAttachmentDto> attachments) { this.attachments = attachments; }

    public List<ComplaintStatusHistoryDto> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<ComplaintStatusHistoryDto> statusHistory) { this.statusHistory = statusHistory; }
}
