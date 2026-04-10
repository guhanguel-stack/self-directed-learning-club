package com.ebook.domain.mybook.controller;

import com.ebook.domain.mybook.dto.MyBookResponse;
import com.ebook.domain.mybook.service.MyBookService;
import com.ebook.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/my-books")
@RequiredArgsConstructor
public class MyBookController {

    private final MyBookService myBookService;

    /** 책 업로드 (multipart) */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MyBookResponse> uploadBook(
            @AuthenticationPrincipal Long userId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        return ApiResponse.ok("책이 등록되었습니다.",
                myBookService.uploadBook(userId, title, description, image, file));
    }

    /** 내 책장 조회 */
    @GetMapping("/me")
    public ApiResponse<List<MyBookResponse>> getMyBooks(
            @AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(myBookService.getMyBooks(userId));
    }

    /** 서점 — 모든 AVAILABLE 책 (본인 제외) */
    @GetMapping
    public ApiResponse<List<MyBookResponse>> getStoreBooks(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(myBookService.getStoreBooks(userId, keyword));
    }

    /** 책 상세 */
    @GetMapping("/{bookId}")
    public ApiResponse<MyBookResponse> getBook(@PathVariable Long bookId) {
        return ApiResponse.ok(myBookService.getBook(bookId));
    }

    /** 책 삭제 */
    @DeleteMapping("/{bookId}")
    public ApiResponse<Void> deleteBook(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long bookId) {
        myBookService.deleteBook(userId, bookId);
        return ApiResponse.ok("책이 삭제되었습니다.", null);
    }
}
