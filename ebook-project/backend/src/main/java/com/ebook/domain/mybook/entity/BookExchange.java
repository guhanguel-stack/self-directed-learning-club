package com.ebook.domain.mybook.entity;

import com.ebook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_exchanges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class BookExchange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 교환 요청자 (A) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    /** 교환 응답자 (B) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", nullable = false)
    private User responder;

    /** A가 제안하는 책 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_book_id", nullable = false)
    private MyBook requesterBook;

    /** B의 책 (A가 원하는 책) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_book_id", nullable = false)
    private MyBook responderBook;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExchangeStatus status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum ExchangeStatus {
        REQUESTED,   // 요청됨
        ACCEPTED,    // 수락됨 → 완료 처리
        COMPLETED,   // 완료
        REJECTED     // 거절
    }

    @Builder
    public BookExchange(User requester, User responder,
                        MyBook requesterBook, MyBook responderBook) {
        this.requester = requester;
        this.responder = responder;
        this.requesterBook = requesterBook;
        this.responderBook = responderBook;
        this.status = ExchangeStatus.REQUESTED;
    }

    public void accept() {
        this.status = ExchangeStatus.ACCEPTED;
    }

    public void complete() {
        this.status = ExchangeStatus.COMPLETED;
    }

    public void reject() {
        this.status = ExchangeStatus.REJECTED;
    }
}
