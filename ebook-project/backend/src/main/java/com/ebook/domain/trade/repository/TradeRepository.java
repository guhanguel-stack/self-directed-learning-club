package com.ebook.domain.trade.repository;

import com.ebook.domain.trade.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByBuyerIdOrSellerIdOrderByTradedAtDesc(Long buyerId, Long sellerId);
    List<Trade> findByListingIdAndStatus(Long listingId, Trade.TradeStatus status);
}
