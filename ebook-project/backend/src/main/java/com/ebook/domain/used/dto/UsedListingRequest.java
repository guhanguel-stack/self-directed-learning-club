package com.ebook.domain.used.dto;

import com.ebook.domain.used.entity.UsedListing;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UsedListingRequest {

    @NotNull(message = "도서 ID를 입력해주세요.")
    private Long bookId;

    @NotNull(message = "거래 방식을 선택해주세요.")
    private UsedListing.PriceType priceType;

    private Long pointPrice; // priceType이 POINT일 때 필수
}
