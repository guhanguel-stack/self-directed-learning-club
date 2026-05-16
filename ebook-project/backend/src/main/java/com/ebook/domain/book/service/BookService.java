package com.ebook.domain.book.service;

import com.ebook.domain.book.dto.BookResponse;
import com.ebook.domain.book.entity.Book;
import com.ebook.domain.book.repository.BookRepository;
import com.ebook.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;
    private final S3Service s3Service;

    public Page<BookResponse> getBooks(String keyword, String category, Pageable pageable) {
        Book.Category categoryEnum = null;
        if (category != null && !category.isBlank()) {
            try {
                categoryEnum = Book.Category.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw CustomException.badRequest("존재하지 않는 카테고리입니다.");
            }
        }
        return bookRepository.searchBooks(keyword, categoryEnum, pageable)
                .map(BookResponse::new);
    }

    public BookResponse getBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));
        return new BookResponse(book);
    }

    // epub 읽기용 presigned URL 반환
    public String getEpubUrl(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));
        return s3Service.generatePresignedUrl(book.getEpubUrl());
    }
}
