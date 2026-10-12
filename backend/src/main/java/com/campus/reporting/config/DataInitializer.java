package com.campus.reporting.config;

import com.campus.reporting.entity.*;
import com.campus.reporting.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:admin}")
    private String adminUsername;

    @Value("${app.admin.default-email:admin@campus.edu}")
    private String adminEmail;

    @Value("${app.admin.default-password:Admin@123}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           ComplaintRepository complaintRepository,
                           ComplaintStatusHistoryRepository historyRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Initialize Departments
        Department elecDept = getOrCreateDepartment("Electrical Maintenance", "ELEC", "Handles power, lights, fans, and wiring", "electrical@campus.edu", "+1-555-0101");
        Department plumbDept = getOrCreateDepartment("Plumbing & Water Supply", "PLUMB", "Handles washrooms, water filters, and pipes", "plumbing@campus.edu", "+1-555-0102");
        Department furnDept = getOrCreateDepartment("Furniture & Carpentry", "FURN", "Handles desks, chairs, boards, and windows", "furniture@campus.edu", "+1-555-0103");
        Department cleanDept = getOrCreateDepartment("Sanitation & Cleanliness", "CLEAN", "Handles cleaning, garbage, and hygiene", "sanitation@campus.edu", "+1-555-0104");
        Department itDept = getOrCreateDepartment("IT & Campus Network", "IT_NET", "Handles campus Wi-Fi, Ethernet, and labs", "it-support@campus.edu", "+1-555-0105");
        Department secDept = getOrCreateDepartment("Campus Safety & Security", "SECURITY", "Handles campus lighting, locks, and safety", "security@campus.edu", "+1-555-0106");

        // 2. Initialize Super Administrator
        User admin = userRepository.findByUsername(adminUsername).orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFullName("Campus System Administrator");
            admin.setPhoneNumber("+1-555-0001");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setActive(true);
            admin = userRepository.save(admin);
            logger.info("Initialized default administrator account: {}", adminUsername);
        }

        // 3. Initialize Demo Staff
        User staffElec = getOrCreateUser("staff_elec", "elec.staff@campus.edu", "Staff@123", "Robert Spark (Electrical)", "+1-555-0002", Role.ROLE_STAFF, elecDept);
        User staffPlumb = getOrCreateUser("staff_plumb", "plumb.staff@campus.edu", "Staff@123", "David Water (Plumbing)", "+1-555-0003", Role.ROLE_STAFF, plumbDept);
        User staffIt = getOrCreateUser("staff_it", "it.staff@campus.edu", "Staff@123", "Sarah Lin (Network)", "+1-555-0004", Role.ROLE_STAFF, itDept);

        // 4. Initialize Demo Students
        User student1 = getOrCreateUser("student_john", "john.doe@student.campus.edu", "Student@123", "John Doe (CS Student)", "+1-555-0005", Role.ROLE_STUDENT, null);
        User student2 = getOrCreateUser("student_jane", "jane.smith@student.campus.edu", "Student@123", "Jane Smith (BioTech Student)", "+1-555-0006", Role.ROLE_STUDENT, null);

        // 5. Initialize Sample Complaints if database has no complaints
        if (complaintRepository.count() == 0) {
            seedSampleComplaints(admin, student1, student2, elecDept, plumbDept, itDept, furnDept, staffElec, staffPlumb, staffIt);
        }
    }

    private Department getOrCreateDepartment(String name, String code, String desc, String email, String phone) {
        return departmentRepository.findByCode(code).orElseGet(() -> {
            Department d = new Department();
            d.setName(name);
            d.setCode(code);
            d.setDescription(desc);
            d.setContactEmail(email);
            d.setContactPhone(phone);
            d.setActive(true);
            return departmentRepository.save(d);
        });
    }

    private User getOrCreateUser(String username, String email, String password, String fullName, String phone, Role role, Department dept) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode(password));
            u.setFullName(fullName);
            u.setPhoneNumber(phone);
            u.setRole(role);
            u.setDepartment(dept);
            u.setActive(true);
            return userRepository.save(u);
        });
    }

    private void seedSampleComplaints(User admin, User student1, User student2,
                                       Department elecDept, Department plumbDept, Department itDept, Department furnDept,
                                       User staffElec, User staffPlumb, User staffIt) {
        // Complaint 1: In Progress
        Complaint c1 = new Complaint();
        c1.setReferenceNo("CMP-20261010-A101");
        c1.setTitle("Water pipe leaking under sink in Science Block Room 204");
        c1.setDescription("Water has been continuously dripping and pooling on the floor, causing a slipping hazard for students.");
        c1.setCategory("Plumbing and Water Leakage");
        c1.setLocation("Science Block, 2nd Floor, Room 204 Washroom");
        c1.setPriority(Priority.HIGH);
        c1.setStatus(ComplaintStatus.IN_PROGRESS);
        c1.setUser(student1);
        c1.setDepartment(plumbDept);
        c1.setAssignedStaff(staffPlumb);
        Complaint saved1 = complaintRepository.save(c1);

        historyRepository.save(new ComplaintStatusHistory(saved1, null, "Reported", "SUBMITTED", "Submitted by student John Doe", student1, null, null));
        historyRepository.save(new ComplaintStatusHistory(saved1, "Reported", "In Progress", "ASSIGNED", "Assigned to Plumbing dept", admin, plumbDept, staffPlumb));
        notificationRepository.save(new Notification(student1, saved1, "Complaint Assigned", "Your complaint CMP-20261010-A101 has been assigned to Plumbing department.", "COMPLAINT_ASSIGNED"));

        // Complaint 2: Reported
        Complaint c2 = new Complaint();
        c2.setReferenceNo("CMP-20261011-B202");
        c2.setTitle("Projector flickering and switching off in Lecture Hall 3");
        c2.setDescription("The ceiling mounted HDMI projector power cord sparks slightly and loses signal repeatedly.");
        c2.setCategory("Electrical");
        c2.setLocation("Engineering Block A, 1st Floor, Lecture Hall 3");
        c2.setPriority(Priority.CRITICAL);
        c2.setStatus(ComplaintStatus.REPORTED);
        c2.setUser(student1);
        c2.setDepartment(elecDept);
        c2.setAssignedStaff(staffElec);
        Complaint saved2 = complaintRepository.save(c2);

        historyRepository.save(new ComplaintStatusHistory(saved2, null, "Reported", "SUBMITTED", "Submitted by student John Doe", student1, null, null));
        notificationRepository.save(new Notification(student1, saved2, "Complaint Submitted", "Your complaint CMP-20261011-B202 was submitted successfully.", "COMPLAINT_SUBMITTED"));

        // Complaint 3: Resolved
        Complaint c3 = new Complaint();
        c3.setReferenceNo("CMP-20261009-C303");
        c3.setTitle("Broken bench and exposed screw in Room 102");
        c3.setDescription("Student bench on the front row has a broken wood plank with sharp screws protruding.");
        c3.setCategory("Furniture");
        c3.setLocation("Academic Block B, Room 102");
        c3.setPriority(Priority.MEDIUM);
        c3.setStatus(ComplaintStatus.RESOLVED);
        c3.setUser(student2);
        c3.setDepartment(furnDept);
        c3.setResolutionNotes("Bench woodwork was replaced and securely bolted with safety caps.");
        c3.setResolvedAt(java.time.OffsetDateTime.now().minusHours(4));
        Complaint saved3 = complaintRepository.save(c3);

        historyRepository.save(new ComplaintStatusHistory(saved3, null, "Reported", "SUBMITTED", "Submitted by Jane Smith", student2, null, null));
        historyRepository.save(new ComplaintStatusHistory(saved3, "Reported", "In Progress", "ASSIGNED", "Assigned to Furniture team", admin, furnDept, null));
        historyRepository.save(new ComplaintStatusHistory(saved3, "In Progress", "Resolved", "RESOLVED", "Bench woodwork was replaced and securely bolted with safety caps.", admin, furnDept, null));
        notificationRepository.save(new Notification(student2, saved3, "Complaint Resolved", "Your complaint CMP-20261009-C303 has been resolved.", "COMPLAINT_RESOLVED"));

        // Complaint 4: In Progress (Wi-Fi)
        Complaint c4 = new Complaint();
        c4.setReferenceNo("CMP-20261012-D404");
        c4.setTitle("Library 2nd Floor Wi-Fi access point offline");
        c4.setDescription("Students cannot connect to campus network in the study cubicles.");
        c4.setCategory("Wi-Fi and Network");
        c4.setLocation("Central Library, 2nd Floor East");
        c4.setPriority(Priority.HIGH);
        c4.setStatus(ComplaintStatus.IN_PROGRESS);
        c4.setUser(student2);
        c4.setDepartment(itDept);
        c4.setAssignedStaff(staffIt);
        Complaint saved4 = complaintRepository.save(c4);

        historyRepository.save(new ComplaintStatusHistory(saved4, null, "Reported", "SUBMITTED", "Submitted by Jane Smith", student2, null, null));
        historyRepository.save(new ComplaintStatusHistory(saved4, "Reported", "In Progress", "ASSIGNED", "Assigned to Sarah Lin", admin, itDept, staffIt));
        notificationRepository.save(new Notification(student2, saved4, "Complaint In Progress", "Investigation underway by Sarah Lin.", "STATUS_CHANGED"));
    }
}
