package com.campus.reporting.dto.request;

import com.campus.reporting.entity.Priority;
import jakarta.validation.constraints.NotNull;

public class AssignComplaintRequest {

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long staffId;

    private Priority priority;

    private String notes;

    public AssignComplaintRequest() {}

    public AssignComplaintRequest(Long departmentId, Long staffId, Priority priority, String notes) {
        this.departmentId = departmentId;
        this.staffId = staffId;
        this.priority = priority;
        this.notes = notes;
    }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
