package com.ebook.domain.used.controller;

import com.ebook.domain.used.dto.ExchangeRequest;
import com.ebook.domain.used.dto.UsedListingRequest;
import com.ebook.domain.used.dto.UsedListingResponse;
import com.ebook.domain.used.service.UsedService;
import com.ebook.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/used")
@RequiredArgsConstructor
public class UsedController {

    private final UsedService usedService;

    @GetMapping
    public ApiResponse<Page<UsedListingResponse>> getListings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String priceType,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ApiResponse.ok(usedService.getListings(keyword, priceType, pageable));
    }

    @GetMapping("/{listingId}")
    public ApiResponse<UsedListingResponse> getListing(@PathVariable Long listingId) {
        return ApiResponse.ok(usedService.getListing(listingId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> createListing(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UsedListingRequest request
    ) {
        usedService.createListing(userId, request);
        return ApiResponse.ok("중고 등록이 완료되었습니다.", null);
    }

    @DeleteMapping("/{listingId}")
    public ApiResponse<Void> cancelListing(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long listingId
    ) {
        usedService.cancelListing(userId, listingId);
        return ApiResponse.ok("중고 등록이 취소되었습니다.", null);
    }

    @PostMapping("/{listingId}/purchase")
    public ApiResponse<Void> purchaseWithPoint(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long listingId
    ) {
        usedService.purchaseWithPoint(userId, listingId);
        return ApiResponse.ok("구매가 완료되었습니다.", null);
    }

    @PostMapping("/{listingId}/exchange")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Long> requestExchange(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long listingId,
            @Valid @RequestBody ExchangeRequest request
    ) {
        Long tradeId = usedService.requestExchange(userId, listingId, request);
        return ApiResponse.ok("교환 신청이 완료되었습니다.", tradeId);
    }

    @PatchMapping("/exchange/{tradeId}/accept")
    public ApiResponse<Void> acceptExchange(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long tradeId
    ) {
        usedService.acceptExchange(userId, tradeId);
        return ApiResponse.ok("교환이 완료되었습니다.", null);
    }

    @PatchMapping("/exchange/{tradeId}/reject")
    public ApiResponse<Void> rejectExchange(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long tradeId
    ) {
        usedService.rejectExchange(userId, tradeId);
        return ApiResponse.ok("교환을 거절했습니다.", null);
    }
}
