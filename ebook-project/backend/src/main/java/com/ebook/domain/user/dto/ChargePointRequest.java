package com.ebook.domain.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChargePointRequest {

    @NotNull(message = "충전 금액을 입력해주세요.")
    @Min(value = 1000, message = "최소 1,000 포인트부터 충전 가능합니다.")
    private Long amount;
}
