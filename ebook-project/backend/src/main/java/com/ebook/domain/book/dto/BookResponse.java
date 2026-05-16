package com.ebook.domain.book.dto;

import com.ebook.domain.book.entity.Book;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String description;
    private String coverImageUrl;
    private Long originalPrice;
    private String category;
    private LocalDateTime createdAt;

    public BookResponse(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.description = book.getDescription();
        this.coverImageUrl = book.getCoverImageUrl();
        this.originalPrice = book.getOriginalPrice();
        this.category = book.getCategory().name();
        this.createdAt = book.getCreatedAt();
    }
}
