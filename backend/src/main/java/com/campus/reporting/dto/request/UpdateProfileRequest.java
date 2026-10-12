package com.campus.reporting.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    private String phoneNumber;

    private String currentPassword;

    @Size(min = 6, max = 50, message = "New password must be at least 6 characters")
    private String newPassword;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String fullName, String phoneNumber, String currentPassword, String newPassword) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
