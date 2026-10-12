package com.campus.reporting.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ComplaintStatusConverter implements AttributeConverter<ComplaintStatus, String> {

    @Override
    public String convertToDatabaseColumn(ComplaintStatus attribute) {
        if (attribute == null) return null;
        return attribute.getValue();
    }

    @Override
    public ComplaintStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return ComplaintStatus.fromValue(dbData);
    }
}
