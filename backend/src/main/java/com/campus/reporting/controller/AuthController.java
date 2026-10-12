package com.campus.reporting.controller;

import com.campus.reporting.dto.request.LoginRequest;
import com.campus.reporting.dto.request.RegisterRequest;
import com.campus.reporting.dto.response.AuthResponse;
import com.campus.reporting.dto.response.UserDto;
import com.campus.reporting.security.UserPrincipal;
import com.campus.reporting.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user login, student registration, and token validation")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with username/email and password to receive a JWT access token")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new Student account")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerStudent(registerRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the profile details of the currently authenticated user")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        UserDto userDto = authService.getCurrentUser(principal);
        return ResponseEntity.ok(userDto);
    }
}
