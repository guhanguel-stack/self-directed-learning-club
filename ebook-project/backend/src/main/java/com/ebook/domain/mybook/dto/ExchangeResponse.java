package com.ebook.domain.mybook.dto;

import com.ebook.domain.mybook.entity.BookExchange;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ExchangeResponse {

    private Long id;
    private Long requesterId;
    private String requesterNickname;
    private Long responderId;
    private String responderNickname;
    private Long requesterBookId;
    private String requesterBookTitle;
    private String requesterBookImageUrl;
    private Long responderBookId;
    private String responderBookTitle;
    private String responderBookImageUrl;
    private String status;
    private LocalDateTime createdAt;

    public ExchangeResponse(BookExchange exchange,
                            String requesterBookImageUrl,
                            String responderBookImageUrl) {
        this.id = exchange.getId();
        this.requesterId = exchange.getRequester().getId();
        this.requesterNickname = exchange.getRequester().getNickname();
        this.responderId = exchange.getResponder().getId();
        this.responderNickname = exchange.getResponder().getNickname();
        this.requesterBookId = exchange.getRequesterBook().getId();
        this.requesterBookTitle = exchange.getRequesterBook().getTitle();
        this.requesterBookImageUrl = requesterBookImageUrl;
        this.responderBookId = exchange.getResponderBook().getId();
        this.responderBookTitle = exchange.getResponderBook().getTitle();
        this.responderBookImageUrl = responderBookImageUrl;
        this.status = exchange.getStatus().name();
        this.createdAt = exchange.getCreatedAt();
    }
}
