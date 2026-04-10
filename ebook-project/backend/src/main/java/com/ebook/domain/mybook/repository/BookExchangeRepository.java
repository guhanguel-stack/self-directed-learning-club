package com.ebook.domain.mybook.repository;

import com.ebook.domain.mybook.entity.BookExchange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookExchangeRepository extends JpaRepository<BookExchange, Long> {

    /** 내가 요청한 교환 목록 */
    List<BookExchange> findByRequesterId(Long requesterId);

    /** 내가 받은 교환 요청 목록 */
    List<BookExchange> findByResponderId(Long responderId);

    /** 특정 책에 이미 REQUESTED 상태의 교환이 있는지 확인 */
    @Query("SELECT COUNT(e) > 0 FROM BookExchange e WHERE " +
           "(e.requesterBook.id = :bookId OR e.responderBook.id = :bookId) " +
           "AND e.status = 'REQUESTED'")
    boolean existsActiveExchangeForBook(@Param("bookId") Long bookId);
}
