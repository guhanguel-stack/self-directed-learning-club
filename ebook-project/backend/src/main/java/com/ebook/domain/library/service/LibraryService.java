package com.ebook.domain.library.service;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.book.repository.BookRepository;
import com.ebook.domain.library.dto.LibraryResponse;
import com.ebook.domain.library.entity.Library;
import com.ebook.domain.library.repository.LibraryRepository;
import com.ebook.domain.user.entity.User;
import com.ebook.domain.user.repository.UserRepository;
import com.ebook.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    // 내 서재 목록
    public List<LibraryResponse> getMyLibrary(Long userId) {
        return libraryRepository.findByUserId(userId).stream()
                .map(LibraryResponse::new)
                .collect(Collectors.toList());
    }

    // 도서 구매 (포인트 차감 + 서재 추가)
    @Transactional
    public void purchaseBook(Long userId, Long bookId) {
        // 이미 보유 중인지 확인
        if (libraryRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw CustomException.badRequest("이미 보유 중인 도서입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));

        // 포인트 차감 (User 엔티티 내에서 잔액 검증)
        user.deductPoint(book.getOriginalPrice());

        // 서재 추가
        Library library = Library.builder()
                .user(user)
                .book(book)
                .build();
        libraryRepository.save(library);
    }
}
