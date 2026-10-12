package com.campus.reporting.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ComplaintStatus {
    REPORTED("Reported"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CANCELLED("Cancelled");

    private final String value;

    ComplaintStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ComplaintStatus fromValue(String text) {
        if (text == null) return null;
        for (ComplaintStatus b : ComplaintStatus.values()) {
            if (b.value.equalsIgnoreCase(text.trim()) || b.name().equalsIgnoreCase(text.trim().replace(" ", "_"))) {
                return b;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + text);
    }

    @Override
    public String toString() {
        return value;
    }
}
