package com.campus.reporting.service;

import com.campus.reporting.dto.request.AssignComplaintRequest;
import com.campus.reporting.dto.request.CreateComplaintRequest;
import com.campus.reporting.dto.request.UpdateStatusRequest;
import com.campus.reporting.dto.response.ComplaintAttachmentDto;
import com.campus.reporting.dto.response.ComplaintDto;
import com.campus.reporting.dto.response.PagedResponse;
import com.campus.reporting.entity.*;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.exception.ResourceNotFoundException;
import com.campus.reporting.exception.UnauthorizedException;
import com.campus.reporting.repository.*;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.util.EntityDtoMapper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintAttachmentRepository attachmentRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            DepartmentRepository departmentRepository,
                            ComplaintAttachmentRepository attachmentRepository,
                            ComplaintStatusHistoryRepository historyRepository,
                            NotificationService notificationService,
                            FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.attachmentRepository = attachmentRepository;
        this.historyRepository = historyRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    private String generateReferenceNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "CMP-" + datePart + "-" + uniqueSuffix;
    }

    @Transactional
    public ComplaintDto createComplaint(CreateComplaintRequest request, List<MultipartFile> files, UserPrincipal currentUser) {
        User student = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found"));

        Complaint complaint = new Complaint();
        complaint.setReferenceNo(generateReferenceNumber());
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setCategory(request.getCategory().trim());
        complaint.setLocation(request.getLocation().trim());
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        complaint.setStatus(ComplaintStatus.REPORTED);
        complaint.setUser(student);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Record Initial History Log
        ComplaintStatusHistory history = new ComplaintStatusHistory(
                savedComplaint,
                null,
                savedComplaint.getStatus().getValue(),
                "SUBMITTED",
                "Complaint lodged by student: " + student.getFullName(),
                student,
                null,
                null
        );
        historyRepository.save(history);

        // Upload and link attachments if present
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String storedName = fileStorageService.storeFile(file);
                    ComplaintAttachment attachment = new ComplaintAttachment(
                            savedComplaint,
                            file.getOriginalFilename(),
                            storedName,
                            file.getContentType(),
                            file.getSize(),
                            fileStorageService.getFileStorageLocation().resolve(storedName).toString(),
                            student
                    );
                    attachmentRepository.save(attachment);
                    savedComplaint.addAttachment(attachment);
                }
            }
        }

        // Notify Student
        notificationService.createNotification(
                student,
                savedComplaint,
                "Complaint Submitted",
                "Your complaint " + savedComplaint.getReferenceNo() + " has been successfully submitted and is under review.",
                "COMPLAINT_SUBMITTED"
        );

        return EntityDtoMapper.toComplaintDto(savedComplaint);
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaintById(Long id, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        validateViewAuthorization(complaint, currentUser);
        return EntityDtoMapper.toComplaintDto(complaint);
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaintByReferenceNo(String referenceNo, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findByReferenceNo(referenceNo)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with Reference: " + referenceNo));

        validateViewAuthorization(complaint, currentUser);
        return EntityDtoMapper.toComplaintDto(complaint);
    }

    private void validateViewAuthorization(Complaint complaint, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_ADMIN) {
            return; // Admin can view any complaint
        }

        if (user.getRole() == Role.ROLE_STUDENT) {
            if (!complaint.getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("You are not authorized to view another user's complaint.");
            }
            return;
        }

        if (user.getRole() == Role.ROLE_STAFF) {
            // Staff can view if assigned to their account or their department
            boolean isAssignedStaff = complaint.getAssignedStaff() != null && complaint.getAssignedStaff().getId().equals(user.getId());
            boolean isAssignedDept = complaint.getDepartment() != null && user.getDepartment() != null &&
                    complaint.getDepartment().getId().equals(user.getDepartment().getId());

            if (!isAssignedStaff && !isAssignedDept) {
                throw new UnauthorizedException("You are not authorized to view complaints outside your department.");
            }
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<ComplaintDto> getComplaints(
            String status,
            String category,
            Long departmentId,
            Priority priority,
            String search,
            int page,
            int size,
            String sortBy,
            String direction,
            UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Role Scoping
            if (user.getRole() == Role.ROLE_STUDENT) {
                predicates.add(cb.equal(root.get("user").get("id"), user.getId()));
            } else if (user.getRole() == Role.ROLE_STAFF) {
                if (user.getDepartment() != null) {
                    Predicate deptPredicate = cb.equal(root.get("department").get("id"), user.getDepartment().getId());
                    Predicate staffPredicate = cb.equal(root.get("assignedStaff").get("id"), user.getId());
                    predicates.add(cb.or(deptPredicate, staffPredicate));
                } else {
                    predicates.add(cb.equal(root.get("assignedStaff").get("id"), user.getId()));
                }
            }

            // Status filter
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                ComplaintStatus complaintStatus = ComplaintStatus.fromValue(status);
                predicates.add(cb.equal(root.get("status"), complaintStatus));
            }

            // Category filter
            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }

            // Department filter
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            // Priority filter
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // Search query (matches title, description, referenceNo, location)
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate titleP = cb.like(cb.lower(root.get("title")), term);
                Predicate descP = cb.like(cb.lower(root.get("description")), term);
                Predicate refP = cb.like(cb.lower(root.get("referenceNo")), term);
                Predicate locP = cb.like(cb.lower(root.get("location")), term);
                predicates.add(cb.or(titleP, descP, refP, locP));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Complaint> complaintPage = complaintRepository.findAll(spec, pageable);
        List<ComplaintDto> content = complaintPage.getContent().stream()
                .map(EntityDtoMapper::toComplaintDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                complaintPage.getNumber(),
                complaintPage.getSize(),
                complaintPage.getTotalElements(),
                complaintPage.getTotalPages(),
                complaintPage.isLast()
        );
    }

    @Transactional
    public ComplaintDto assignComplaint(Long id, AssignComplaintRequest request, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User admin = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        User staff = null;
        if (request.getStaffId() != null) {
            staff = userRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + request.getStaffId()));
            if (staff.getRole() != Role.ROLE_STAFF) {
                throw new BadRequestException("Assigned user is not a staff member.");
            }
        }

        String previousStatus = complaint.getStatus().getValue();
        complaint.setDepartment(department);
        complaint.setAssignedStaff(staff);

        if (request.getPriority() != null) {
            complaint.setPriority(request.getPriority());
        }

        // Move from Reported to In Progress automatically upon assignment
        if (complaint.getStatus() == ComplaintStatus.REPORTED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Record history log
        String notes = request.getNotes() != null ? request.getNotes() :
                "Assigned to " + department.getName() + (staff != null ? " (Staff: " + staff.getFullName() + ")" : "");

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                previousStatus,
                saved.getStatus().getValue(),
                "ASSIGNED",
                notes,
                admin,
                department,
                staff
        );
        historyRepository.save(history);

        // Notify student
        notificationService.createNotification(
                saved.getUser(),
                saved,
                "Complaint Assigned",
                "Your complaint " + saved.getReferenceNo() + " has been assigned to " + department.getName() +
                        (staff != null ? " (Staff: " + staff.getFullName() + ")" : "") + ".",
                "COMPLAINT_ASSIGNED"
        );

        // Notify staff if specifically assigned
        if (staff != null) {
            notificationService.createNotification(
                    staff,
                    saved,
                    "New Complaint Assigned",
                    "You have been assigned a new complaint: " + saved.getReferenceNo() + " - " + saved.getTitle(),
                    "COMPLAINT_ASSIGNED"
            );
        }

        return EntityDtoMapper.toComplaintDto(saved);
    }

    @Transactional
    public ComplaintDto updateStatus(Long id, UpdateStatusRequest request, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User performer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate Staff authorization
        if (performer.getRole() == Role.ROLE_STAFF) {
            boolean isAssignedStaff = complaint.getAssignedStaff() != null && complaint.getAssignedStaff().getId().equals(performer.getId());
            boolean isAssignedDept = complaint.getDepartment() != null && performer.getDepartment() != null &&
                    complaint.getDepartment().getId().equals(performer.getDepartment().getId());

            if (!isAssignedStaff && !isAssignedDept) {
                throw new UnauthorizedException("You are not authorized to update complaints outside your department/assignment.");
            }
        }

        ComplaintStatus targetStatus = ComplaintStatus.fromValue(request.getStatus());
        ComplaintStatus currentStatus = complaint.getStatus();

        // Validate state transitions: Reported -> In Progress -> Resolved
        if (currentStatus == ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Resolved complaints cannot be reopened or changed without administrator review.");
        }
        if (currentStatus == ComplaintStatus.CANCELLED) {
            throw new BadRequestException("Cancelled complaints cannot have their status updated.");
        }

        if (targetStatus == ComplaintStatus.RESOLVED) {
            if (request.getResolutionNotes() == null || request.getResolutionNotes().trim().length() < 5) {
                throw new BadRequestException("Resolution description (minimum 5 characters) is required when marking a complaint as Resolved.");
            }
            complaint.setResolutionNotes(request.getResolutionNotes().trim());
            complaint.setResolvedAt(OffsetDateTime.now());
        }

        String previousStatusStr = currentStatus.getValue();
        complaint.setStatus(targetStatus);
        Complaint saved = complaintRepository.save(complaint);

        String actionType = targetStatus == ComplaintStatus.RESOLVED ? "RESOLVED" : "STATUS_UPDATED";
        String logNotes = request.getNotes() != null && !request.getNotes().trim().isEmpty() ?
                request.getNotes().trim() :
                (targetStatus == ComplaintStatus.RESOLVED ? request.getResolutionNotes() : "Status updated to " + targetStatus.getValue());

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                previousStatusStr,
                targetStatus.getValue(),
                actionType,
                logNotes,
                performer,
                saved.getDepartment(),
                saved.getAssignedStaff()
        );
        historyRepository.save(history);

        // Notify student
        String notificationTitle = targetStatus == ComplaintStatus.RESOLVED ? "Complaint Resolved" : "Complaint Status Updated";
        String notificationMsg = targetStatus == ComplaintStatus.RESOLVED ?
                "Your complaint " + saved.getReferenceNo() + " has been resolved. Note: " + saved.getResolutionNotes() :
                "Your complaint " + saved.getReferenceNo() + " status is now " + targetStatus.getValue() + ".";

        notificationService.createNotification(
                saved.getUser(),
                saved,
                notificationTitle,
                notificationMsg,
                targetStatus == ComplaintStatus.RESOLVED ? "COMPLAINT_RESOLVED" : "STATUS_CHANGED"
        );

        return EntityDtoMapper.toComplaintDto(saved);
    }

    @Transactional
    public ComplaintDto cancelComplaint(Long id, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only cancel your own complaints.");
        }

        // Cancel allowed only if Reported and not assigned
        if (complaint.getStatus() != ComplaintStatus.REPORTED || complaint.getDepartment() != null || complaint.getAssignedStaff() != null) {
            throw new BadRequestException("Complaint cannot be cancelled once it has been processed or assigned.");
        }

        String prevStatus = complaint.getStatus().getValue();
        complaint.setStatus(ComplaintStatus.CANCELLED);
        Complaint saved = complaintRepository.save(complaint);

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                prevStatus,
                ComplaintStatus.CANCELLED.getValue(),
                "CANCELLED",
                "Complaint cancelled by student",
                user,
                null,
                null
        );
        historyRepository.save(history);

        notificationService.createNotification(
                user,
                saved,
                "Complaint Cancelled",
                "You have successfully cancelled complaint " + saved.getReferenceNo(),
                "COMPLAINT_CANCELLED"
        );

        return EntityDtoMapper.toComplaintDto(saved);
    }

    @Transactional
    public ComplaintAttachmentDto addAttachment(Long complaintId, MultipartFile file, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        validateViewAuthorization(complaint, currentUser);

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String storedName = fileStorageService.storeFile(file);
        ComplaintAttachment attachment = new ComplaintAttachment(
                complaint,
                file.getOriginalFilename(),
                storedName,
                file.getContentType(),
                file.getSize(),
                fileStorageService.getFileStorageLocation().resolve(storedName).toString(),
                user
        );

        ComplaintAttachment saved = attachmentRepository.save(attachment);
        return EntityDtoMapper.toComplaintAttachmentDto(saved);
    }
}
