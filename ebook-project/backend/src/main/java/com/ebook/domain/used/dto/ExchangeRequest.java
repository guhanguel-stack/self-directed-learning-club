package com.ebook.domain.used.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ExchangeRequest {

    @NotNull(message = "교환으로 제시할 도서 ID를 입력해주세요.")
    private Long offeredBookId; // 내가 내놓을 책
}
