package com.campus.reporting.repository;

import com.campus.reporting.entity.Complaint;
import com.campus.reporting.entity.ComplaintStatus;
import com.campus.reporting.entity.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByReferenceNo(String referenceNo);

    Page<Complaint> findByUserId(Long userId, Pageable pageable);

    Page<Complaint> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<Complaint> findByAssignedStaffId(Long assignedStaffId, Pageable pageable);

    long countByStatus(ComplaintStatus status);

    long countByPriority(Priority priority);

    long countByAssignedStaffId(Long staffId);

    long countByAssignedStaffIdAndStatus(Long staffId, ComplaintStatus status);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT d.name, COUNT(c) FROM Complaint c JOIN c.department d GROUP BY d.name")
    List<Object[]> countComplaintsByDepartment();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatus();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countComplaintsByPriority();

    List<Complaint> findTop5ByOrderByCreatedAtDesc();

    List<Complaint> findTop5ByAssignedStaffIdOrderByCreatedAtDesc(Long staffId);

    List<Complaint> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
