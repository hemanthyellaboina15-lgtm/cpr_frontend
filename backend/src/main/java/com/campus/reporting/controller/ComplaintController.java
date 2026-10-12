package com.campus.reporting.controller;

import com.campus.reporting.dto.request.AssignComplaintRequest;
import com.campus.reporting.dto.request.CreateComplaintRequest;
import com.campus.reporting.dto.request.UpdateStatusRequest;
import com.campus.reporting.dto.response.ComplaintAttachmentDto;
import com.campus.reporting.dto.response.ComplaintDto;
import com.campus.reporting.dto.response.PagedResponse;
import com.campus.reporting.entity.Priority;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaints", description = "Endpoints for lodging, viewing, assigning, and resolving campus complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Student: Lodge a new campus complaint with optional file attachments (multipart/form-data)")
    public ResponseEntity<ComplaintDto> createComplaintMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam(value = "priority", required = false, defaultValue = "MEDIUM") Priority priority,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        CreateComplaintRequest request = new CreateComplaintRequest(title, description, category, location, priority);
        ComplaintDto response = complaintService.createComplaint(request, files, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Student: Lodge a new campus complaint using JSON (without immediate files)")
    public ResponseEntity<ComplaintDto> createComplaintJson(
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ComplaintDto response = complaintService.createComplaint(request, null, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List complaints with dynamic search, filters, and pagination (Role-scoped)")
    public ResponseEntity<PagedResponse<ComplaintDto>> getComplaints(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "priority", required = false) Priority priority,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "direction", defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PagedResponse<ComplaintDto> response = complaintService.getComplaints(
                status, category, departmentId, priority, search, page, size, sortBy, direction, currentUser
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint details by ID (including history and attachments)")
    public ResponseEntity<ComplaintDto> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintById(id, currentUser));
    }

    @GetMapping("/ref/{referenceNo}")
    @Operation(summary = "Get complaint details by human-readable Reference Number")
    public ResponseEntity<ComplaintDto> getComplaintByReferenceNo(
            @PathVariable String referenceNo,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintByReferenceNo(referenceNo, currentUser));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Assign complaint to department and staff member")
    public ResponseEntity<ComplaintDto> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, request, currentUser));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Staff/Admin: Update complaint status (Reported -> In Progress -> Resolved)")
    public ResponseEntity<ComplaintDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, currentUser));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Student: Cancel a reported complaint if it has not yet been assigned or processed")
    public ResponseEntity<ComplaintDto> cancelComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.cancelComplaint(id, currentUser));
    }

    @PostMapping(value = "/{id}/attachments", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @Operation(summary = "Attach an image to an existing complaint")
    public ResponseEntity<ComplaintAttachmentDto> addAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.addAttachment(id, file, currentUser));
    }
}
