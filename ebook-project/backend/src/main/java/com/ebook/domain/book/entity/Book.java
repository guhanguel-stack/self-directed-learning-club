package com.ebook.domain.book.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String coverImageUrl; // S3 경로

    private String epubUrl;       // S3 경로

    @Column(nullable = false)
    private Long originalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Book(String title, String author, String description,
                String coverImageUrl, String epubUrl,
                Long originalPrice, Category category) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.coverImageUrl = coverImageUrl;
        this.epubUrl = epubUrl;
        this.originalPrice = originalPrice;
        this.category = category;
    }

    public enum Category {
        NOVEL, POETRY, ESSAY, HISTORY, PHILOSOPHY, SCIENCE, OTHER
    }
}
