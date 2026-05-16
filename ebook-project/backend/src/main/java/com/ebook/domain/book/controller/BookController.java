package com.ebook.domain.book.controller;

import com.ebook.domain.book.dto.BookResponse;
import com.ebook.domain.book.service.BookService;
import com.ebook.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 도서 목록 (검색 + 카테고리 필터 + 페이징)
    @GetMapping
    public ApiResponse<Page<BookResponse>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ApiResponse.ok(bookService.getBooks(keyword, category, pageable));
    }

    // 도서 상세
    @GetMapping("/{bookId}")
    public ApiResponse<BookResponse> getBook(@PathVariable Long bookId) {
        return ApiResponse.ok(bookService.getBook(bookId));
    }

    // epub 읽기 URL 발급 (인증 필요)
    @GetMapping("/{bookId}/read")
    public ApiResponse<String> getEpubUrl(@PathVariable Long bookId) {
        return ApiResponse.ok(bookService.getEpubUrl(bookId));
    }
}
