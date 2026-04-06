package com.ebook.domain.user.controller;

import com.ebook.domain.user.dto.ChargePointRequest;
import com.ebook.domain.user.dto.UserResponse;
import com.ebook.domain.user.service.UserService;
import com.ebook.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyInfo(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(userService.getMyInfo(userId));
    }

    @PostMapping("/me/points/charge")
    public ApiResponse<Void> chargePoint(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ChargePointRequest request
    ) {
        userService.chargePoint(userId, request.getAmount());
        return ApiResponse.ok("포인트가 충전되었습니다.", null);
    }
}
