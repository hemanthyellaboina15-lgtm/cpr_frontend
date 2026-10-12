package com.campus.reporting.service;

import com.campus.reporting.dto.response.NotificationDto;
import com.campus.reporting.dto.response.PagedResponse;
import com.campus.reporting.entity.Complaint;
import com.campus.reporting.entity.Notification;
import com.campus.reporting.entity.User;
import com.campus.reporting.exception.ResourceNotFoundException;
import com.campus.reporting.exception.UnauthorizedException;
import com.campus.reporting.repository.NotificationRepository;
import com.campus.reporting.util.EntityDtoMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User user, Complaint complaint, String title, String message, String notificationType) {
        if (user == null) return;
        Notification notification = new Notification(user, complaint, title, message, notificationType);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationDto> dtoList = notificationPage.getContent().stream()
                .map(EntityDtoMapper::toNotificationDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Cannot mark notification belonging to another user");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return EntityDtoMapper.toNotificationDto(updated);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
