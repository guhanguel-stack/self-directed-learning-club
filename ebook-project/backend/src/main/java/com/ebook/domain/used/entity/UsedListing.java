package com.ebook.domain.used.entity;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "used_listings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class UsedListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriceType priceType; // POINT or EXCHANGE

    private Long pointPrice; // priceType이 POINT일 때만 사용

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UsedListing(User seller, Book book, PriceType priceType, Long pointPrice) {
        this.seller = seller;
        this.book = book;
        this.priceType = priceType;
        this.pointPrice = pointPrice;
        this.status = ListingStatus.ACTIVE;
    }

    public void reserve() {
        this.status = ListingStatus.RESERVED;
    }

    public void complete() {
        this.status = ListingStatus.COMPLETED;
    }

    public void cancel() {
        this.status = ListingStatus.CANCELLED;
    }

    public enum PriceType {
        POINT, EXCHANGE
    }

    public enum ListingStatus {
        ACTIVE, RESERVED, COMPLETED, CANCELLED
    }
}
