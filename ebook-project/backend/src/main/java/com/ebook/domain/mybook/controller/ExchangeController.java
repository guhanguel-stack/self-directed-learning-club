package com.ebook.domain.mybook.controller;

import com.ebook.domain.mybook.dto.ExchangeCreateRequest;
import com.ebook.domain.mybook.dto.ExchangeResponse;
import com.ebook.domain.mybook.service.MyBookService;
import com.ebook.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchanges")
@RequiredArgsConstructor
public class ExchangeController {

    private final MyBookService myBookService;

    /** 교환 요청 생성 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ExchangeResponse> requestExchange(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ExchangeCreateRequest request) {
        return ApiResponse.ok("교환 요청을 보냈습니다.",
                myBookService.requestExchange(userId, request));
    }

    /** 내 교환 목록 (보낸 + 받은 통합) */
    @GetMapping("/me")
    public ApiResponse<List<ExchangeResponse>> getMyExchanges(
            @AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(myBookService.getMyExchanges(userId));
    }

    /** 교환 수락 */
    @PatchMapping("/{exchangeId}/accept")
    public ApiResponse<ExchangeResponse> acceptExchange(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long exchangeId) {
        return ApiResponse.ok("교환이 완료되었습니다.",
                myBookService.acceptExchange(userId, exchangeId));
    }

    /** 교환 거절 */
    @PatchMapping("/{exchangeId}/reject")
    public ApiResponse<ExchangeResponse> rejectExchange(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long exchangeId) {
        return ApiResponse.ok("교환 요청을 거절했습니다.",
                myBookService.rejectExchange(userId, exchangeId));
    }
}
