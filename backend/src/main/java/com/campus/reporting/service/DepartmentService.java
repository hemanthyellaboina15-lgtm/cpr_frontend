package com.campus.reporting.service;

import com.campus.reporting.dto.request.CreateDepartmentRequest;
import com.campus.reporting.dto.response.DepartmentDto;
import com.campus.reporting.entity.Department;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.exception.ResourceNotFoundException;
import com.campus.reporting.repository.DepartmentRepository;
import com.campus.reporting.util.EntityDtoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(EntityDtoMapper::toDepartmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(EntityDtoMapper::toDepartmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return EntityDtoMapper.toDepartmentDto(dept);
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Department name already exists: " + request.getName());
        }
        if (departmentRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BadRequestException("Department code already exists: " + request.getCode());
        }

        Department dept = new Department();
        dept.setName(request.getName().trim());
        dept.setCode(request.getCode().trim().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setContactEmail(request.getContactEmail());
        dept.setContactPhone(request.getContactPhone());
        dept.setActive(request.getActive() != null ? request.getActive() : true);

        Department saved = departmentRepository.save(dept);
        return EntityDtoMapper.toDepartmentDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, CreateDepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (!dept.getName().equalsIgnoreCase(request.getName().trim()) && departmentRepository.existsByName(request.getName().trim())) {
            throw new BadRequestException("Department name already exists: " + request.getName());
        }
        if (!dept.getCode().equalsIgnoreCase(request.getCode().trim()) && departmentRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Department code already exists: " + request.getCode());
        }

        dept.setName(request.getName().trim());
        dept.setCode(request.getCode().trim().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setContactEmail(request.getContactEmail());
        dept.setContactPhone(request.getContactPhone());
        if (request.getActive() != null) {
            dept.setActive(request.getActive());
        }

        Department updated = departmentRepository.save(dept);
        return EntityDtoMapper.toDepartmentDto(updated);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        dept.setActive(false);
        departmentRepository.save(dept);
    }
}
