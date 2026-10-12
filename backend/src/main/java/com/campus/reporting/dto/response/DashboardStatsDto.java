package com.campus.reporting.dto.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalComplaints;
    private long reportedComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long cancelledComplaints;
    private long highAndCriticalComplaints;

    private long totalStudents;
    private long totalStaff;
    private long totalDepartments;

    private Map<String, Long> categoryDistribution = new HashMap<>();
    private Map<String, Long> departmentDistribution = new HashMap<>();
    private Map<String, Long> priorityDistribution = new HashMap<>();
    private Map<String, Long> staffWorkload = new HashMap<>();

    private List<ComplaintDto> recentComplaints;
    private List<ComplaintStatusHistoryDto> recentStatusChanges;

    public DashboardStatsDto() {}

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public long getReportedComplaints() { return reportedComplaints; }
    public void setReportedComplaints(long reportedComplaints) { this.reportedComplaints = reportedComplaints; }

    public long getInProgressComplaints() { return inProgressComplaints; }
    public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }

    public long getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }

    public long getCancelledComplaints() { return cancelledComplaints; }
    public void setCancelledComplaints(long cancelledComplaints) { this.cancelledComplaints = cancelledComplaints; }

    public long getHighAndCriticalComplaints() { return highAndCriticalComplaints; }
    public void setHighAndCriticalComplaints(long highAndCriticalComplaints) { this.highAndCriticalComplaints = highAndCriticalComplaints; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public Map<String, Long> getDepartmentDistribution() { return departmentDistribution; }
    public void setDepartmentDistribution(Map<String, Long> departmentDistribution) { this.departmentDistribution = departmentDistribution; }

    public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
    public void setPriorityDistribution(Map<String, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }

    public Map<String, Long> getStaffWorkload() { return staffWorkload; }
    public void setStaffWorkload(Map<String, Long> staffWorkload) { this.staffWorkload = staffWorkload; }

    public List<ComplaintDto> getRecentComplaints() { return recentComplaints; }
    public void setRecentComplaints(List<ComplaintDto> recentComplaints) { this.recentComplaints = recentComplaints; }

    public List<ComplaintStatusHistoryDto> getRecentStatusChanges() { return recentStatusChanges; }
    public void setRecentStatusChanges(List<ComplaintStatusHistoryDto> recentStatusChanges) { this.recentStatusChanges = recentStatusChanges; }
}
