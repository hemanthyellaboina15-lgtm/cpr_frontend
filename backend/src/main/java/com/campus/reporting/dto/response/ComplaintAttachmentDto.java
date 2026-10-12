package com.campus.reporting.dto.response;

import java.time.OffsetDateTime;

public class ComplaintAttachmentDto {

    private Long id;
    private Long complaintId;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;
    private String downloadUrl;
    private String uploadedByName;
    private OffsetDateTime createdAt;

    public ComplaintAttachmentDto() {}

    public ComplaintAttachmentDto(Long id, Long complaintId, String originalFileName, String storedFileName, String fileType, Long fileSize, String downloadUrl, String uploadedByName, OffsetDateTime createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.downloadUrl = downloadUrl;
        this.uploadedByName = uploadedByName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
