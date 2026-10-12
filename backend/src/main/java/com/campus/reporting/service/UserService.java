package com.campus.reporting.service;

import com.campus.reporting.dto.request.CreateStaffRequest;
import com.campus.reporting.dto.request.UpdateProfileRequest;
import com.campus.reporting.dto.response.UserDto;
import com.campus.reporting.entity.Department;
import com.campus.reporting.entity.Role;
import com.campus.reporting.entity.User;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.exception.ResourceNotFoundException;
import com.campus.reporting.repository.DepartmentRepository;
import com.campus.reporting.repository.UserRepository;
import com.campus.reporting.util.EntityDtoMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(EntityDtoMapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(EntityDtoMapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return EntityDtoMapper.toUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getStaffByDepartment(Long departmentId) {
        return userRepository.findByRoleAndDepartmentId(Role.ROLE_STAFF, departmentId).stream()
                .map(EntityDtoMapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createStaff(CreateStaffRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        User staff = new User();
        staff.setUsername(request.getUsername().trim());
        staff.setEmail(request.getEmail().trim().toLowerCase());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setFullName(request.getFullName().trim());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setRole(Role.ROLE_STAFF);
        staff.setDepartment(department);
        staff.setActive(true);

        User saved = userRepository.save(staff);
        return EntityDtoMapper.toUserDto(saved);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        User updated = userRepository.save(user);
        return EntityDtoMapper.toUserDto(updated);
    }

    @Transactional
    public UserDto toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new BadRequestException("Cannot deactivate administrator accounts");
        }

        user.setActive(active);
        User updated = userRepository.save(user);
        return EntityDtoMapper.toUserDto(updated);
    }
}
