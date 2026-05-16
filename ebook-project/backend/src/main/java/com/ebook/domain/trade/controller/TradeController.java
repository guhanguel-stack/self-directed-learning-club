package com.ebook.domain.trade.controller;

import com.ebook.domain.trade.dto.TradeResponse;
import com.ebook.domain.trade.service.TradeService;
import com.ebook.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @GetMapping("/me")
    public ApiResponse<List<TradeResponse>> getMyTrades(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(tradeService.getMyTrades(userId));
    }
}
