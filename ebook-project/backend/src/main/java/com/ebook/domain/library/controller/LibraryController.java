package com.ebook.domain.library.controller;

import com.ebook.domain.library.dto.LibraryResponse;
import com.ebook.domain.library.service.LibraryService;
import com.ebook.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping
    public ApiResponse<List<LibraryResponse>> getMyLibrary(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(libraryService.getMyLibrary(userId));
    }

    @PostMapping("/purchase/{bookId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> purchaseBook(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long bookId
    ) {
        libraryService.purchaseBook(userId, bookId);
        return ApiResponse.ok("도서를 구매했습니다.", null);
    }
}
