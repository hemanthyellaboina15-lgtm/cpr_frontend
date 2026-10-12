package com.campus.reporting.controller;

import com.campus.reporting.dto.response.DashboardStatsDto;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard & Analytics", description = "Endpoints for retrieving system metrics, statistics, and role dashboards")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Get campus-wide overview metrics, distribution maps, and workload reports")
    public ResponseEntity<DashboardStatsDto> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardStats());
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Student: Get student-specific complaint metrics and recent activities")
    public ResponseEntity<DashboardStatsDto> getStudentStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getStudentDashboardStats(currentUser));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Staff: Get staff-specific assignment statistics and pending tasks")
    public ResponseEntity<DashboardStatsDto> getStaffStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getStaffDashboardStats(currentUser));
    }
}
