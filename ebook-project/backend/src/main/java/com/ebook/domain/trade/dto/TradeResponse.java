package com.ebook.domain.trade.dto;

import com.ebook.domain.trade.entity.Trade;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TradeResponse {
    private Long tradeId;
    private Long listingId;
    private String bookTitle;
    private String buyerNickname;
    private String sellerNickname;
    private String tradeType;
    private String status;
    private Long offeredBookId;
    private LocalDateTime tradedAt;

    public TradeResponse(Trade trade) {
        this.tradeId = trade.getId();
        this.listingId = trade.getListing().getId();
        this.bookTitle = trade.getListing().getBook().getTitle();
        this.buyerNickname = trade.getBuyer().getNickname();
        this.sellerNickname = trade.getSeller().getNickname();
        this.tradeType = trade.getTradeType().name();
        this.status = trade.getStatus().name();
        this.offeredBookId = trade.getOfferedBookId();
        this.tradedAt = trade.getTradedAt();
    }
}
