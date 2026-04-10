package com.ebook.domain.mybook.repository;

import com.ebook.domain.mybook.entity.MyBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MyBookRepository extends JpaRepository<MyBook, Long> {

    /** 내 책장 — 특정 소유자의 책 (EXCHANGED 제외) */
    List<MyBook> findByOwnerIdAndStatusNot(Long ownerId, MyBook.MyBookStatus status);

    /** 서점 — 모든 사용자의 AVAILABLE 책 */
    List<MyBook> findByStatus(MyBook.MyBookStatus status);

    /** 서점 — 다른 사용자의 AVAILABLE 책 (본인 제외) */
    List<MyBook> findByStatusAndOwnerIdNot(MyBook.MyBookStatus status, Long ownerId);

    /** 검색 (제목 포함) */
    @Query("SELECT b FROM MyBook b WHERE b.status = 'AVAILABLE' AND LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MyBook> searchByTitle(@Param("keyword") String keyword);
}
