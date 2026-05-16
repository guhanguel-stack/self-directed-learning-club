package com.ebook.domain.library.entity;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "library")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Library {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // false: 중고 등록 중 (거래 불가), true: 보유 중
    @Column(nullable = false)
    private boolean isAvailable = true;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime purchasedAt;

    @Builder
    public Library(User user, Book book) {
        this.user = user;
        this.book = book;
        this.isAvailable = true;
    }

    public void markAsListed() {
        this.isAvailable = false;
    }

    public void markAsAvailable() {
        this.isAvailable = true;
    }
}
