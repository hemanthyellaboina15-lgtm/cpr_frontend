package com.campus.reporting.controller;

import com.campus.reporting.dto.request.CreateStaffRequest;
import com.campus.reporting.dto.request.UpdateProfileRequest;
import com.campus.reporting.dto.response.ApiResponse;
import com.campus.reporting.dto.response.UserDto;
import com.campus.reporting.entity.Role;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Users & Administration", description = "Endpoints for managing user accounts, staff profiles, and administrative permissions")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/profile")
    @Operation(summary = "Get the current logged-in user profile")
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getUserById(principal.getId()));
    }

    @PutMapping("/users/profile")
    @Operation(summary = "Update current user profile (full name, phone, password)")
    public ResponseEntity<UserDto> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: List all registered system users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/users/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: List users filtered by role")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @PostMapping("/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new Staff account assigned to a Department")
    public ResponseEntity<UserDto> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(userService.createStaff(request));
    }

    @PatchMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Activate or deactivate a user account")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, active));
    }

    @GetMapping("/users/staff/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get all staff members of a specific department")
    public ResponseEntity<List<UserDto>> getStaffByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(userService.getStaffByDepartment(departmentId));
    }
}
