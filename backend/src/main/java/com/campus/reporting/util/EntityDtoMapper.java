package com.campus.reporting.util;

import com.campus.reporting.dto.response.*;
import com.campus.reporting.entity.*;

import java.util.stream.Collectors;

public class EntityDtoMapper {

    public static DepartmentDto toDepartmentDto(Department dept) {
        if (dept == null) return null;
        return new DepartmentDto(
                dept.getId(),
                dept.getName(),
                dept.getCode(),
                dept.getDescription(),
                dept.getContactEmail(),
                dept.getContactPhone(),
                dept.isActive(),
                dept.getCreatedAt()
        );
    }

    public static UserDto toUserDto(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole(),
                toDepartmentDto(user.getDepartment()),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    public static ComplaintAttachmentDto toComplaintAttachmentDto(ComplaintAttachment attachment) {
        if (attachment == null) return null;
        String downloadUrl = "/api/attachments/" + attachment.getStoredFileName();
        String uploaderName = attachment.getUploadedBy() != null ? attachment.getUploadedBy().getFullName() : "Unknown";
        return new ComplaintAttachmentDto(
                attachment.getId(),
                attachment.getComplaint() != null ? attachment.getComplaint().getId() : null,
                attachment.getOriginalFileName(),
                attachment.getStoredFileName(),
                attachment.getFileType(),
                attachment.getFileSize(),
                downloadUrl,
                uploaderName,
                attachment.getCreatedAt()
        );
    }

    public static ComplaintStatusHistoryDto toComplaintStatusHistoryDto(ComplaintStatusHistory history) {
        if (history == null) return null;
        String performerName = history.getPerformedBy() != null ? history.getPerformedBy().getFullName() : "System";
        String performerRole = history.getPerformedBy() != null && history.getPerformedBy().getRole() != null ? history.getPerformedBy().getRole().name() : "";
        String deptName = history.getAssignedDepartment() != null ? history.getAssignedDepartment().getName() : null;
        String staffName = history.getAssignedStaff() != null ? history.getAssignedStaff().getFullName() : null;

        return new ComplaintStatusHistoryDto(
                history.getId(),
                history.getComplaint() != null ? history.getComplaint().getId() : null,
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getActionType(),
                history.getNotes(),
                performerName,
                performerRole,
                deptName,
                staffName,
                history.getCreatedAt()
        );
    }

    public static ComplaintDto toComplaintDto(Complaint complaint) {
        if (complaint == null) return null;
        ComplaintDto dto = new ComplaintDto();
        dto.setId(complaint.getId());
        dto.setReferenceNo(complaint.getReferenceNo());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setCategory(complaint.getCategory());
        dto.setLocation(complaint.getLocation());
        dto.setPriority(complaint.getPriority());
        dto.setStatus(complaint.getStatus());
        dto.setStudent(toUserDto(complaint.getUser()));
        dto.setDepartment(toDepartmentDto(complaint.getDepartment()));
        dto.setAssignedStaff(toUserDto(complaint.getAssignedStaff()));
        dto.setResolutionNotes(complaint.getResolutionNotes());
        dto.setResolvedAt(complaint.getResolvedAt());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());

        if (complaint.getAttachments() != null) {
            dto.setAttachments(complaint.getAttachments().stream()
                    .map(EntityDtoMapper::toComplaintAttachmentDto)
                    .collect(Collectors.toList()));
        }

        if (complaint.getStatusHistory() != null) {
            dto.setStatusHistory(complaint.getStatusHistory().stream()
                    .map(EntityDtoMapper::toComplaintStatusHistoryDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public static NotificationDto toNotificationDto(Notification notification) {
        if (notification == null) return null;
        return new NotificationDto(
                notification.getId(),
                notification.getComplaint() != null ? notification.getComplaint().getId() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getNotificationType(),
                notification.getCreatedAt()
        );
    }
}
