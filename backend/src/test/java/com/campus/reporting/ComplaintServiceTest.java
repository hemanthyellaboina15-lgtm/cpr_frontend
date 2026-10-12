package com.campus.reporting;

import com.campus.reporting.dto.request.AssignComplaintRequest;
import com.campus.reporting.dto.request.CreateComplaintRequest;
import com.campus.reporting.dto.request.UpdateStatusRequest;
import com.campus.reporting.dto.response.ComplaintDto;
import com.campus.reporting.entity.*;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.exception.UnauthorizedException;
import com.campus.reporting.repository.*;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.ComplaintService;
import com.campus.reporting.service.FileStorageService;
import com.campus.reporting.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ComplaintAttachmentRepository attachmentRepository;

    @Mock
    private ComplaintStatusHistoryRepository historyRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private FileStorageService fileStorageService;

    private ComplaintService complaintService;

    private User studentUser;
    private User adminUser;
    private User staffUser;
    private Department elecDepartment;

    @BeforeEach
    void setUp() {
        complaintService = new ComplaintService(
                complaintRepository,
                userRepository,
                departmentRepository,
                attachmentRepository,
                historyRepository,
                notificationService,
                fileStorageService
        );

        elecDepartment = new Department(1L, "Electrical Maintenance", "ELEC", "Handles electrical issues", "elec@campus.edu", "+1-555-0101", true);

        studentUser = new User();
        studentUser.setId(5L);
        studentUser.setUsername("student1");
        studentUser.setFullName("Student One");
        studentUser.setRole(Role.ROLE_STUDENT);
        studentUser.setActive(true);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setFullName("Admin User");
        adminUser.setRole(Role.ROLE_ADMIN);
        adminUser.setActive(true);

        staffUser = new User();
        staffUser.setId(2L);
        staffUser.setUsername("staff1");
        staffUser.setFullName("Staff One");
        staffUser.setRole(Role.ROLE_STAFF);
        staffUser.setDepartment(elecDepartment);
        staffUser.setActive(true);
    }

    @Test
    void testCreateComplaintSuccess() {
        CreateComplaintRequest request = new CreateComplaintRequest(
                "Broken Light Bulb",
                "Light bulb is broken in Room 101",
                "Electrical",
                "Room 101",
                Priority.HIGH
        );

        UserPrincipal principal = new UserPrincipal(5L, "student1", "st@campus.edu", "pass", true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));

        when(userRepository.findById(5L)).thenReturn(Optional.of(studentUser));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(100L);
            return c;
        });

        ComplaintDto result = complaintService.createComplaint(request, null, principal);

        assertNotNull(result);
        assertEquals("Broken Light Bulb", result.getTitle());
        assertEquals(ComplaintStatus.REPORTED, result.getStatus());
        assertEquals(Priority.HIGH, result.getPriority());
        assertTrue(result.getReferenceNo().startsWith("CMP-"));
        verify(historyRepository, times(1)).save(any());
        verify(notificationService, times(1)).createNotification(any(), any(), any(), any(), any());
    }

    @Test
    void testAssignComplaintSuccess() {
        Complaint complaint = new Complaint();
        complaint.setId(100L);
        complaint.setReferenceNo("CMP-20261012-001");
        complaint.setTitle("Broken Light");
        complaint.setStatus(ComplaintStatus.REPORTED);
        complaint.setUser(studentUser);

        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(elecDepartment));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignComplaintRequest assignRequest = new AssignComplaintRequest(1L, 2L, Priority.CRITICAL, "Urgent task");
        UserPrincipal adminPrincipal = new UserPrincipal(1L, "admin", "ad@campus.edu", "pass", true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

        ComplaintDto assigned = complaintService.assignComplaint(100L, assignRequest, adminPrincipal);

        assertNotNull(assigned);
        assertEquals(ComplaintStatus.IN_PROGRESS, assigned.getStatus());
        assertEquals(Priority.CRITICAL, assigned.getPriority());
        assertEquals("Electrical Maintenance", assigned.getDepartment().getName());
        assertEquals("Staff One", assigned.getAssignedStaff().getFullName());
    }

    @Test
    void testUpdateStatusToResolvedRequiresResolutionNotes() {
        Complaint complaint = new Complaint();
        complaint.setId(100L);
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setDepartment(elecDepartment);
        complaint.setAssignedStaff(staffUser);

        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));

        UpdateStatusRequest req = new UpdateStatusRequest("Resolved", "Done", ""); // empty resolution notes
        UserPrincipal staffPrincipal = new UserPrincipal(2L, "staff1", "st@campus.edu", "pass", true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STAFF")));

        assertThrows(BadRequestException.class, () -> complaintService.updateStatus(100L, req, staffPrincipal));
    }

    @Test
    void testCancelComplaintFailsIfAlreadyAssigned() {
        Complaint complaint = new Complaint();
        complaint.setId(100L);
        complaint.setStatus(ComplaintStatus.REPORTED);
        complaint.setUser(studentUser);
        complaint.setDepartment(elecDepartment); // already assigned!

        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(5L)).thenReturn(Optional.of(studentUser));

        UserPrincipal studentPrincipal = new UserPrincipal(5L, "student1", "st@campus.edu", "pass", true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));

        assertThrows(BadRequestException.class, () -> complaintService.cancelComplaint(100L, studentPrincipal));
    }

    @Test
    void testUnauthorizedStudentCannotCancelAnotherStudentComplaint() {
        User otherStudent = new User();
        otherStudent.setId(99L);

        Complaint complaint = new Complaint();
        complaint.setId(100L);
        complaint.setStatus(ComplaintStatus.REPORTED);
        complaint.setUser(otherStudent); // belongs to user 99

        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(5L)).thenReturn(Optional.of(studentUser)); // current user is 5

        UserPrincipal studentPrincipal = new UserPrincipal(5L, "student1", "st@campus.edu", "pass", true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));

        assertThrows(UnauthorizedException.class, () -> complaintService.cancelComplaint(100L, studentPrincipal));
    }
}
