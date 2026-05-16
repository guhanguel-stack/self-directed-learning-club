package com.ebook.domain.trade.service;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.book.repository.BookRepository;
import com.ebook.domain.trade.dto.TradeResponse;
import com.ebook.domain.trade.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradeService {

    private final TradeRepository tradeRepository;
    private final BookRepository bookRepository;

    public List<TradeResponse> getMyTrades(Long userId) {
        return tradeRepository
                .findByBuyerIdOrSellerIdOrderByTradedAtDesc(userId, userId)
                .stream()
                .map(trade -> {
                    Book offeredBook = null;
                    if (trade.getOfferedBookId() != null) {
                        offeredBook = bookRepository.findById(trade.getOfferedBookId()).orElse(null);
                    }
                    return new TradeResponse(trade, offeredBook);
                })
                .collect(Collectors.toList());
    }
}
