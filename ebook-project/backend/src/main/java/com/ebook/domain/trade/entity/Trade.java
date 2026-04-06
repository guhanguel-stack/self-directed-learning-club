package com.ebook.domain.trade.entity;

import com.ebook.domain.used.entity.UsedListing;
import com.ebook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private UsedListing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType tradeType;

    // 교환 거래일 때 구매자가 제시한 책 ID
    private Long offeredBookId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeStatus status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime tradedAt;

    @Builder
    public Trade(UsedListing listing, User buyer, User seller,
                 TradeType tradeType, Long offeredBookId) {
        this.listing = listing;
        this.buyer = buyer;
        this.seller = seller;
        this.tradeType = tradeType;
        this.offeredBookId = offeredBookId;
        this.status = TradeStatus.PENDING;
    }

    public void accept() {
        this.status = TradeStatus.COMPLETED;
    }

    public void reject() {
        this.status = TradeStatus.REJECTED;
    }

    public enum TradeType {
        POINT, EXCHANGE
    }

    public enum TradeStatus {
        PENDING, COMPLETED, REJECTED
    }
}
