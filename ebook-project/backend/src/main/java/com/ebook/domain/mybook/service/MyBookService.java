package com.ebook.domain.mybook.service;

import com.ebook.domain.book.service.S3Service;
import com.ebook.domain.mybook.dto.ExchangeCreateRequest;
import com.ebook.domain.mybook.dto.ExchangeResponse;
import com.ebook.domain.mybook.dto.MyBookResponse;
import com.ebook.domain.mybook.entity.BookExchange;
import com.ebook.domain.mybook.entity.MyBook;
import com.ebook.domain.mybook.repository.BookExchangeRepository;
import com.ebook.domain.mybook.repository.MyBookRepository;
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
public class MyBookService {

    private final MyBookRepository myBookRepository;
    private final BookExchangeRepository bookExchangeRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    // ── 내 책장 조회 ──────────────────────────────────────
    public List<MyBookResponse> getMyBooks(Long userId) {
        return myBookRepository
                .findByOwnerIdAndStatusNot(userId, MyBook.MyBookStatus.EXCHANGED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── 서점 (전체 AVAILABLE 책) ──────────────────────────
    public List<MyBookResponse> getStoreBooks(Long currentUserId, String keyword) {
        List<MyBook> books;
        if (keyword != null && !keyword.isBlank()) {
            books = myBookRepository.searchByTitle(keyword);
        } else if (currentUserId != null) {
            books = myBookRepository.findByStatusAndOwnerIdNot(
                    MyBook.MyBookStatus.AVAILABLE, currentUserId);
        } else {
            books = myBookRepository.findByStatus(MyBook.MyBookStatus.AVAILABLE);
        }
        return books.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── 책 상세 ───────────────────────────────────────────
    public MyBookResponse getBook(Long bookId) {
        MyBook book = myBookRepository.findById(bookId)
                .orElseThrow(() -> CustomException.notFound("책을 찾을 수 없습니다."));
        return toResponse(book);
    }

    // ── 책 삭제 ───────────────────────────────────────────
    @Transactional
    public void deleteBook(Long userId, Long bookId) {
        MyBook book = myBookRepository.findById(bookId)
                .orElseThrow(() -> CustomException.notFound("책을 찾을 수 없습니다."));
        if (!book.getOwner().getId().equals(userId)) {
            throw CustomException.badRequest("본인의 책만 삭제할 수 있습니다.");
        }
        if (book.getStatus() == MyBook.MyBookStatus.IN_EXCHANGE) {
            throw CustomException.badRequest("교환 진행 중인 책은 삭제할 수 없습니다.");
        }
        myBookRepository.delete(book);
    }

    // ── 교환 요청 ─────────────────────────────────────────
    @Transactional
    public ExchangeResponse requestExchange(Long userId, ExchangeCreateRequest request) {
        User requester = getUser(userId);

        MyBook myBook = myBookRepository.findById(request.getMyBookId())
                .orElseThrow(() -> CustomException.notFound("내 책을 찾을 수 없습니다."));
        MyBook targetBook = myBookRepository.findById(request.getTargetBookId())
                .orElseThrow(() -> CustomException.notFound("교환 대상 책을 찾을 수 없습니다."));

        // 검증
        if (!myBook.getOwner().getId().equals(userId)) {
            throw CustomException.badRequest("본인의 책만 제안할 수 있습니다.");
        }
        if (targetBook.getOwner().getId().equals(userId)) {
            throw CustomException.badRequest("본인의 책에는 교환 요청할 수 없습니다.");
        }
        if (!targetBook.isPurchasedFromSite()) {
            throw CustomException.badRequest("사이트에서 구매한 책만 교환 가능합니다.");
        }
        if (myBook.getStatus() != MyBook.MyBookStatus.AVAILABLE) {
            throw CustomException.badRequest("이미 교환 중인 책입니다.");
        }
        if (targetBook.getStatus() != MyBook.MyBookStatus.AVAILABLE) {
            throw CustomException.badRequest("상대방의 책이 교환 가능 상태가 아닙니다.");
        }

        User responder = targetBook.getOwner();

        // 교환 상태로 변경
        myBook.startExchange();
        targetBook.startExchange();

        BookExchange exchange = BookExchange.builder()
                .requester(requester)
                .responder(responder)
                .requesterBook(myBook)
                .responderBook(targetBook)
                .build();

        bookExchangeRepository.save(exchange);
        return toExchangeResponse(exchange);
    }

    // ── 교환 수락 → 완료 처리 ────────────────────────────
    @Transactional
    public ExchangeResponse acceptExchange(Long userId, Long exchangeId) {
        BookExchange exchange = getExchange(exchangeId);

        if (!exchange.getResponder().getId().equals(userId)) {
            throw CustomException.badRequest("요청을 받은 사용자만 수락할 수 있습니다.");
        }
        if (exchange.getStatus() != BookExchange.ExchangeStatus.REQUESTED) {
            throw CustomException.badRequest("이미 처리된 요청입니다.");
        }

        // 책 소유자 교환
        MyBook requesterBook = exchange.getRequesterBook();
        MyBook responderBook = exchange.getResponderBook();

        User requester = exchange.getRequester();
        User responder = exchange.getResponder();

        requesterBook.changeOwner(responder);  // A 책 → B 소유
        responderBook.changeOwner(requester);  // B 책 → A 소유

        exchange.accept();
        exchange.complete();

        return toExchangeResponse(exchange);
    }

    // ── 교환 거절 ─────────────────────────────────────────
    @Transactional
    public ExchangeResponse rejectExchange(Long userId, Long exchangeId) {
        BookExchange exchange = getExchange(exchangeId);

        if (!exchange.getResponder().getId().equals(userId)) {
            throw CustomException.badRequest("요청을 받은 사용자만 거절할 수 있습니다.");
        }
        if (exchange.getStatus() != BookExchange.ExchangeStatus.REQUESTED) {
            throw CustomException.badRequest("이미 처리된 요청입니다.");
        }

        exchange.getRequesterBook().cancelExchange();
        exchange.getResponderBook().cancelExchange();
        exchange.reject();

        return toExchangeResponse(exchange);
    }

    // ── 내 교환 목록 ──────────────────────────────────────
    public List<ExchangeResponse> getMyExchanges(Long userId) {
        List<BookExchange> sent     = bookExchangeRepository.findByRequesterId(userId);
        List<BookExchange> received = bookExchangeRepository.findByResponderId(userId);

        sent.addAll(received);
        return sent.stream()
                .distinct()
                .map(this::toExchangeResponse)
                .collect(Collectors.toList());
    }

    // ── 내부 헬퍼 ─────────────────────────────────────────
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
    }

    private BookExchange getExchange(Long id) {
        return bookExchangeRepository.findById(id)
                .orElseThrow(() -> CustomException.notFound("교환 요청을 찾을 수 없습니다."));
    }

    private String resolveUrl(String urlOrKey) {
        if (urlOrKey == null) return null;
        if (urlOrKey.startsWith("http")) return urlOrKey; // 외부 URL (시드 데이터)
        return s3Service.generatePresignedUrl(urlOrKey);  // S3 키
    }

    private MyBookResponse toResponse(MyBook book) {
        return new MyBookResponse(
                book,
                resolveUrl(book.getImageUrl()),
                resolveUrl(book.getFileUrl())
        );
    }

    private ExchangeResponse toExchangeResponse(BookExchange exchange) {
        return new ExchangeResponse(
                exchange,
                resolveUrl(exchange.getRequesterBook().getImageUrl()),
                resolveUrl(exchange.getResponderBook().getImageUrl())
        );
    }
}
