package com.ebook.domain.used.repository;

import com.ebook.domain.used.entity.UsedListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsedListingRepository extends JpaRepository<UsedListing, Long> {

    List<UsedListing> findBySellerIdAndBookIdAndStatus(
            Long sellerId, Long bookId, UsedListing.ListingStatus status);

    @Query("SELECT u FROM UsedListing u WHERE u.seller.id = :sellerId AND u.book.id = :bookId " +
           "AND u.status IN ('ACTIVE', 'RESERVED')")
    List<UsedListing> findActiveOrReservedBySellerIdAndBookId(
            @Param("sellerId") Long sellerId, @Param("bookId") Long bookId);

    @Query("SELECT u FROM UsedListing u JOIN u.book b WHERE " +
           "u.status = 'ACTIVE' AND " +
           "(:keyword IS NULL OR b.title LIKE %:keyword% OR b.author LIKE %:keyword%) AND " +
           "(:priceType IS NULL OR u.priceType = :priceType)")
    Page<UsedListing> searchListings(
            @Param("keyword") String keyword,
            @Param("priceType") UsedListing.PriceType priceType,
            Pageable pageable
    );
}
