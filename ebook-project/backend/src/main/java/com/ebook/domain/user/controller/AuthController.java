package com.ebook.domain.user.controller;

import com.ebook.domain.user.dto.LoginRequest;
import com.ebook.domain.user.dto.RegisterRequest;
import com.ebook.domain.user.dto.TokenResponse;
import com.ebook.domain.user.service.UserService;
import com.ebook.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ApiResponse.ok("회원가입이 완료되었습니다.", null);
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = userService.login(request);
        return ApiResponse.ok(tokens);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal Long userId) {
        userService.logout(userId);
        return ApiResponse.ok("로그아웃되었습니다.", null);
    }

    @PostMapping("/reissue")
    public ApiResponse<TokenResponse> reissue(@RequestHeader("Refresh-Token") String refreshToken) {
        TokenResponse tokens = userService.reissue(refreshToken);
        return ApiResponse.ok(tokens);
    }
}
