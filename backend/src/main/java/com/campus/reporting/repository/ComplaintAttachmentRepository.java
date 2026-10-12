package com.campus.reporting.repository;

import com.campus.reporting.entity.ComplaintAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, Long> {
    List<ComplaintAttachment> findByComplaintId(Long complaintId);
    Optional<ComplaintAttachment> findByStoredFileName(String storedFileName);
}
