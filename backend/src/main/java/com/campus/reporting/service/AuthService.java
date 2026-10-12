package com.campus.reporting.service;

import com.campus.reporting.dto.request.LoginRequest;
import com.campus.reporting.dto.request.RegisterRequest;
import com.campus.reporting.dto.response.AuthResponse;
import com.campus.reporting.dto.response.UserDto;
import com.campus.reporting.entity.Role;
import com.campus.reporting.entity.User;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.repository.UserRepository;
import com.campus.reporting.security.JwtTokenProvider;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.util.EntityDtoMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername().trim(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        UserDto userDto = EntityDtoMapper.toUserDto(user);
        return new AuthResponse(jwt, userDto);
    }

    @Transactional
    public AuthResponse registerStudent(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken: " + registerRequest.getUsername());
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already registered: " + registerRequest.getEmail());
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername().trim());
        user.setEmail(registerRequest.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName().trim());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setRole(Role.ROLE_STUDENT);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Authenticate automatically after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getUsername().trim(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, EntityDtoMapper.toUserDto(savedUser));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return EntityDtoMapper.toUserDto(user);
    }
}
