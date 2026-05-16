package com.ebook.domain.mybook.controller;

import com.ebook.domain.mybook.dto.MyBookResponse;
import com.ebook.domain.mybook.service.MyBookService;
import com.ebook.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-books")
@RequiredArgsConstructor
public class MyBookController {

    private final MyBookService myBookService;

    @GetMapping("/me")
    public ApiResponse<List<MyBookResponse>> getMyBooks(
            @AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(myBookService.getMyBooks(userId));
    }

    @GetMapping
    public ApiResponse<List<MyBookResponse>> getStoreBooks(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(myBookService.getStoreBooks(userId, keyword));
    }

    @GetMapping("/{bookId}")
    public ApiResponse<MyBookResponse> getBook(@PathVariable Long bookId) {
        return ApiResponse.ok(myBookService.getBook(bookId));
    }

    @DeleteMapping("/{bookId}")
    public ApiResponse<Void> deleteBook(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long bookId) {
        myBookService.deleteBook(userId, bookId);
        return ApiResponse.ok("책이 삭제되었습니다.", null);
    }
}
