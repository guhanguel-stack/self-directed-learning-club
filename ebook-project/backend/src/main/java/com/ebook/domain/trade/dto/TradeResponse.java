package com.ebook.domain.trade.dto;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.trade.entity.Trade;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TradeResponse {
    private Long tradeId;
    private Long listingId;
    private String bookTitle;
    private String bookCoverImageUrl;
    private String buyerNickname;
    private String sellerNickname;
    private String tradeType;
    private String status;
    private Long offeredBookId;
    private String offeredBookTitle;
    private String offeredBookCoverImageUrl;
    private LocalDateTime tradedAt;

    public TradeResponse(Trade trade, Book offeredBook) {
        this.tradeId = trade.getId();
        this.listingId = trade.getListing().getId();
        this.bookTitle = trade.getListing().getBook().getTitle();
        this.bookCoverImageUrl = trade.getListing().getBook().getCoverImageUrl();
        this.buyerNickname = trade.getBuyer().getNickname();
        this.sellerNickname = trade.getSeller().getNickname();
        this.tradeType = trade.getTradeType().name();
        this.status = trade.getStatus().name();
        this.offeredBookId = trade.getOfferedBookId();
        if (offeredBook != null) {
            this.offeredBookTitle = offeredBook.getTitle();
            this.offeredBookCoverImageUrl = offeredBook.getCoverImageUrl();
        }
        this.tradedAt = trade.getTradedAt();
    }

    public TradeResponse(Trade trade) {
        this(trade, null);
    }
}
