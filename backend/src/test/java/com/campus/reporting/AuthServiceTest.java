package com.campus.reporting;

import com.campus.reporting.dto.request.LoginRequest;
import com.campus.reporting.dto.request.RegisterRequest;
import com.campus.reporting.dto.response.AuthResponse;
import com.campus.reporting.entity.Role;
import com.campus.reporting.entity.User;
import com.campus.reporting.exception.BadRequestException;
import com.campus.reporting.repository.UserRepository;
import com.campus.reporting.security.JwtTokenProvider;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, userRepository, passwordEncoder, tokenProvider);
    }

    @Test
    void testRegisterStudentSuccess() {
        RegisterRequest request = new RegisterRequest("new_student", "new@campus.edu", "pass123", "New Student", "+1-555-9999");

        when(userRepository.existsByUsername("new_student")).thenReturn(false);
        when(userRepository.existsByEmail("new@campus.edu")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setUsername("new_student");
        savedUser.setEmail("new@campus.edu");
        savedUser.setFullName("New Student");
        savedUser.setRole(Role.ROLE_STUDENT);
        savedUser.setActive(true);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock.jwt.token");

        AuthResponse response = authService.registerStudent(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("new_student", response.getUser().getUsername());
        assertEquals(Role.ROLE_STUDENT, response.getUser().getRole());
    }

    @Test
    void testRegisterStudentDuplicateUsernameThrowsException() {
        RegisterRequest request = new RegisterRequest("existing_user", "test@campus.edu", "pass123", "Existing User", null);
        when(userRepository.existsByUsername("existing_user")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerStudent(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testAuthenticateUserSuccess() {
        LoginRequest request = new LoginRequest("admin", "Admin@123");

        UserPrincipal principal = new UserPrincipal(1L, "admin", "admin@campus.edu", "encoded", true, Collections.emptyList());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt.admin.token");

        User user = new User();
        user.setId(1L);
        user.setUsername("admin");
        user.setEmail("admin@campus.edu");
        user.setFullName("Administrator");
        user.setRole(Role.ROLE_ADMIN);
        user.setActive(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        AuthResponse response = authService.authenticateUser(request);

        assertNotNull(response);
        assertEquals("jwt.admin.token", response.getToken());
        assertEquals("admin", response.getUser().getUsername());
        assertEquals(Role.ROLE_ADMIN, response.getUser().getRole());
    }
}
