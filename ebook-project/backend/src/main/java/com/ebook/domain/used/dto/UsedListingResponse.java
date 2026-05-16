package com.ebook.domain.used.dto;

import com.ebook.domain.used.entity.UsedListing;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UsedListingResponse {
    private Long listingId;
    private Long bookId;
    private String title;
    private String author;
    private String coverImageUrl;
    private String sellerNickname;
    private String priceType;
    private Long pointPrice;
    private String status;
    private LocalDateTime createdAt;

    public UsedListingResponse(UsedListing listing) {
        this.listingId = listing.getId();
        this.bookId = listing.getBook().getId();
        this.title = listing.getBook().getTitle();
        this.author = listing.getBook().getAuthor();
        this.coverImageUrl = listing.getBook().getCoverImageUrl();
        this.sellerNickname = listing.getSeller().getNickname();
        this.priceType = listing.getPriceType().name();
        this.pointPrice = listing.getPointPrice();
        this.status = listing.getStatus().name();
        this.createdAt = listing.getCreatedAt();
    }
}
