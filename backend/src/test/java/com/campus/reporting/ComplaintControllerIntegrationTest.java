package com.campus.reporting;

import com.campus.reporting.dto.request.LoginRequest;
import com.campus.reporting.dto.request.RegisterRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ComplaintControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFullWorkflowRegistrationLoginAndComplaintTracking() throws Exception {
        // 1. Register a new student
        RegisterRequest registerReq = new RegisterRequest(
                "integration_student",
                "integration@campus.edu",
                "Student@123",
                "Integration Student",
                "+1-555-4321"
        );

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.username", is("integration_student")))
                .andReturn();

        JsonNode regNode = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String studentToken = regNode.get("token").asText();

        // 2. Submit a complaint as student (JSON)
        String complaintJson = """
                {
                    "title": "Air Conditioner Leaking Water",
                    "description": "AC unit in computer lab 3 is dripping water continuously on keyboards.",
                    "category": "Electrical",
                    "location": "IT Block, Lab 3",
                    "priority": "HIGH"
                }
                """;

        MvcResult complaintResult = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(complaintJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.referenceNo").isNotEmpty())
                .andExpect(jsonPath("$.status", is("Reported")))
                .andReturn();

        JsonNode complaintNode = objectMapper.readTree(complaintResult.getResponse().getContentAsString());
        long complaintId = complaintNode.get("id").asLong();

        // 3. Log in as administrator
        LoginRequest adminLogin = new LoginRequest("admin", "Admin@123");
        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        JsonNode adminNode = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString());
        String adminToken = adminNode.get("token").asText();

        // 4. Admin assigns the complaint to Department 1
        String assignJson = """
                {
                    "departmentId": 1,
                    "priority": "CRITICAL",
                    "notes": "Assigned with high urgency"
                }
                """;

        mockMvc.perform(put("/api/complaints/" + complaintId + "/assign")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("In Progress")))
                .andExpect(jsonPath("$.priority", is("CRITICAL")));

        // 5. Admin updates status to Resolved
        String resolveJson = """
                {
                    "status": "Resolved",
                    "resolutionNotes": "Technician replaced the drain pipe and tested cooling."
                }
                """;

        mockMvc.perform(put("/api/complaints/" + complaintId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resolveJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Resolved")))
                .andExpect(jsonPath("$.resolutionNotes", containsString("drain pipe")));

        // 6. Student views the resolved complaint
        mockMvc.perform(get("/api/complaints/" + complaintId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Resolved")))
                .andExpect(jsonPath("$.statusHistory", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    void testUnauthorizedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }
}
