package com.ebook.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Column(nullable = false)
    private Long pointBalance = 0L;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public User(String email, String password, String nickname) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.pointBalance = 0L;
    }

    public void chargePoint(Long amount) {
        this.pointBalance += amount;
    }

    public void deductPoint(Long amount) {
        if (this.pointBalance < amount) {
            throw new IllegalStateException("포인트가 부족합니다.");
        }
        this.pointBalance -= amount;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}
