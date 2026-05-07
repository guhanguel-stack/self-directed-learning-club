package com.ebook.domain.library.dto;

import com.ebook.domain.library.entity.Library;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class LibraryResponse {
    private Long libraryId;
    private Long bookId;
    private String title;
    private String author;
    private String coverImageUrl;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private LocalDateTime purchasedAt;

    public LibraryResponse(Library library) {
        this.libraryId = library.getId();
        this.bookId = library.getBook().getId();
        this.title = library.getBook().getTitle();
        this.author = library.getBook().getAuthor();
        this.coverImageUrl = library.getBook().getCoverImageUrl();
        this.isAvailable = library.isAvailable();
        this.purchasedAt = library.getPurchasedAt();
    }
}
