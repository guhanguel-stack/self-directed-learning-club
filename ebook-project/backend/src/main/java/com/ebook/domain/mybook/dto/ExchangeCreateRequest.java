package com.ebook.domain.mybook.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ExchangeCreateRequest {

    /** 내가 제안하는 내 책 ID */
    @NotNull(message = "제안할 책을 선택해주세요.")
    private Long myBookId;

    /** 상대방의 책 ID (내가 원하는 책) */
    @NotNull(message = "교환 대상 책을 선택해주세요.")
    private Long targetBookId;
}
