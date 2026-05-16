package com.ebook.domain.mybook.entity;

import com.ebook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "my_books")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class MyBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;   // S3 key 또는 외부 URL

    private String fileUrl;    // S3 key 또는 외부 URL (PDF)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /** 사이트에서 구매한 책만 true → 교환 요청 가능 */
    @Column(nullable = false)
    private boolean purchasedFromSite = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MyBookStatus status = MyBookStatus.AVAILABLE;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MyBook(String title, String description, String imageUrl,
                  String fileUrl, User owner, boolean purchasedFromSite) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.fileUrl = fileUrl;
        this.owner = owner;
        this.purchasedFromSite = purchasedFromSite;
        this.status = MyBookStatus.AVAILABLE;
    }

    public void startExchange() {
        this.status = MyBookStatus.IN_EXCHANGE;
    }

    public void completeExchange() {
        this.status = MyBookStatus.EXCHANGED;
    }

    public void cancelExchange() {
        this.status = MyBookStatus.AVAILABLE;
    }

    public void changeOwner(User newOwner) {
        this.owner = newOwner;
        this.status = MyBookStatus.AVAILABLE;
        this.purchasedFromSite = true; // 교환으로 받은 책은 교환 가능
    }

    public enum MyBookStatus {
        AVAILABLE,    // 교환 가능
        IN_EXCHANGE,  // 교환 진행 중
        EXCHANGED     // 교환 완료 (이전됨)
    }
}
