package com.campus.reporting.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {

    @NotBlank(message = "New status is required")
    private String status;

    private String notes;

    private String resolutionNotes;

    public UpdateStatusRequest() {}

    public UpdateStatusRequest(String status, String notes, String resolutionNotes) {
        this.status = status;
        this.notes = notes;
        this.resolutionNotes = resolutionNotes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
