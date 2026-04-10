package com.ebook.domain.mybook.dto;

import com.ebook.domain.mybook.entity.MyBook;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MyBookResponse {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String fileUrl;
    private Long ownerId;
    private String ownerNickname;
    private boolean purchasedFromSite;
    private String status;
    private LocalDateTime createdAt;

    public MyBookResponse(MyBook book, String imageUrl, String fileUrl) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.description = book.getDescription();
        this.imageUrl = imageUrl;
        this.fileUrl = fileUrl;
        this.ownerId = book.getOwner().getId();
        this.ownerNickname = book.getOwner().getNickname();
        this.purchasedFromSite = book.isPurchasedFromSite();
        this.status = book.getStatus().name();
        this.createdAt = book.getCreatedAt();
    }
}
