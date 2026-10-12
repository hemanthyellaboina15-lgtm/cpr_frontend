package com.campus.reporting.repository;

import com.campus.reporting.entity.ComplaintStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {
    List<ComplaintStatusHistory> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
    List<ComplaintStatusHistory> findTop10ByOrderByCreatedAtDesc();
}
