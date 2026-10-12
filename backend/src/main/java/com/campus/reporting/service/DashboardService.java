package com.campus.reporting.service;

import com.campus.reporting.dto.response.DashboardStatsDto;
import com.campus.reporting.entity.*;
import com.campus.reporting.exception.ResourceNotFoundException;
import com.campus.reporting.repository.*;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.util.EntityDtoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    public DashboardService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            DepartmentRepository departmentRepository,
                            ComplaintStatusHistoryRepository historyRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getAdminDashboardStats() {
        DashboardStatsDto dto = new DashboardStatsDto();

        dto.setTotalComplaints(complaintRepository.count());
        dto.setReportedComplaints(complaintRepository.countByStatus(ComplaintStatus.REPORTED));
        dto.setInProgressComplaints(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        dto.setResolvedComplaints(complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        dto.setCancelledComplaints(complaintRepository.countByStatus(ComplaintStatus.CANCELLED));

        long highCount = complaintRepository.countByPriority(Priority.HIGH);
        long critCount = complaintRepository.countByPriority(Priority.CRITICAL);
        dto.setHighAndCriticalComplaints(highCount + critCount);

        dto.setTotalStudents(userRepository.findByRole(Role.ROLE_STUDENT).size());
        dto.setTotalStaff(userRepository.findByRole(Role.ROLE_STAFF).size());
        dto.setTotalDepartments(departmentRepository.count());

        // Category distribution
        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByCategory()) {
            categoryMap.put((String) row[0], (Long) row[1]);
        }
        dto.setCategoryDistribution(categoryMap);

        // Department distribution
        Map<String, Long> deptMap = new HashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByDepartment()) {
            deptMap.put((String) row[0], (Long) row[1]);
        }
        dto.setDepartmentDistribution(deptMap);

        // Priority distribution
        Map<String, Long> prioMap = new HashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByPriority()) {
            Priority p = (Priority) row[0];
            prioMap.put(p.name(), (Long) row[1]);
        }
        dto.setPriorityDistribution(prioMap);

        // Staff workload distribution
        Map<String, Long> workloadMap = new HashMap<>();
        List<User> staffList = userRepository.findByRole(Role.ROLE_STAFF);
        for (User staff : staffList) {
            long activeTasks = complaintRepository.countByAssignedStaffIdAndStatus(staff.getId(), ComplaintStatus.IN_PROGRESS);
            workloadMap.put(staff.getFullName(), activeTasks);
        }
        dto.setStaffWorkload(workloadMap);

        // Recent complaints
        List<Complaint> recents = complaintRepository.findTop5ByOrderByCreatedAtDesc();
        dto.setRecentComplaints(recents.stream().map(EntityDtoMapper::toComplaintDto).collect(Collectors.toList()));

        // Recent status changes
        List<ComplaintStatusHistory> historyList = historyRepository.findTop10ByOrderByCreatedAtDesc();
        dto.setRecentStatusChanges(historyList.stream().map(EntityDtoMapper::toComplaintStatusHistoryDto).collect(Collectors.toList()));

        return dto;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStudentDashboardStats(UserPrincipal currentUser) {
        DashboardStatsDto dto = new DashboardStatsDto();

        User student = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Complaint> myComplaints = complaintRepository.findTop5ByUserIdOrderByCreatedAtDesc(student.getId());

        long total = 0, reported = 0, inProgress = 0, resolved = 0, cancelled = 0;
        for (Complaint c : complaintRepository.findAll()) {
            if (c.getUser().getId().equals(student.getId())) {
                total++;
                if (c.getStatus() == ComplaintStatus.REPORTED) reported++;
                else if (c.getStatus() == ComplaintStatus.IN_PROGRESS) inProgress++;
                else if (c.getStatus() == ComplaintStatus.RESOLVED) resolved++;
                else if (c.getStatus() == ComplaintStatus.CANCELLED) cancelled++;
            }
        }

        dto.setTotalComplaints(total);
        dto.setReportedComplaints(reported);
        dto.setInProgressComplaints(inProgress);
        dto.setResolvedComplaints(resolved);
        dto.setCancelledComplaints(cancelled);
        dto.setRecentComplaints(myComplaints.stream().map(EntityDtoMapper::toComplaintDto).collect(Collectors.toList()));

        return dto;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStaffDashboardStats(UserPrincipal currentUser) {
        DashboardStatsDto dto = new DashboardStatsDto();

        User staff = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        long total = complaintRepository.countByAssignedStaffId(staff.getId());
        long inProgress = complaintRepository.countByAssignedStaffIdAndStatus(staff.getId(), ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByAssignedStaffIdAndStatus(staff.getId(), ComplaintStatus.RESOLVED);

        dto.setTotalComplaints(total);
        dto.setInProgressComplaints(inProgress);
        dto.setResolvedComplaints(resolved);

        List<Complaint> recents = complaintRepository.findTop5ByAssignedStaffIdOrderByCreatedAtDesc(staff.getId());
        dto.setRecentComplaints(recents.stream().map(EntityDtoMapper::toComplaintDto).collect(Collectors.toList()));

        return dto;
    }
}
