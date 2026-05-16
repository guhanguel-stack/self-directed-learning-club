package com.ebook.domain.used.service;

import com.ebook.domain.book.entity.Book;
import com.ebook.domain.book.repository.BookRepository;
import com.ebook.domain.library.entity.Library;
import com.ebook.domain.library.repository.LibraryRepository;
import com.ebook.domain.trade.entity.Trade;
import com.ebook.domain.trade.repository.TradeRepository;
import com.ebook.domain.used.dto.ExchangeRequest;
import com.ebook.domain.used.dto.UsedListingRequest;
import com.ebook.domain.used.dto.UsedListingResponse;
import com.ebook.domain.used.entity.UsedListing;
import com.ebook.domain.used.repository.UsedListingRepository;
import com.ebook.domain.user.entity.User;
import com.ebook.domain.user.repository.UserRepository;
import com.ebook.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsedService {

    private final UsedListingRepository usedListingRepository;
    private final LibraryRepository libraryRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TradeRepository tradeRepository;

    // 중고 목록 조회
    public Page<UsedListingResponse> getListings(String keyword, String priceType, Pageable pageable) {
        UsedListing.PriceType priceTypeEnum = null;
        if (priceType != null && !priceType.isBlank()) {
            try {
                priceTypeEnum = UsedListing.PriceType.valueOf(priceType.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw CustomException.badRequest("올바르지 않은 거래 방식입니다.");
            }
        }
        return usedListingRepository.searchListings(keyword, priceTypeEnum, pageable)
                .map(UsedListingResponse::new);
    }

    // 중고 상세 조회
    public UsedListingResponse getListing(Long listingId) {
        UsedListing listing = usedListingRepository.findById(listingId)
                .orElseThrow(() -> CustomException.notFound("중고 게시글을 찾을 수 없습니다."));
        return new UsedListingResponse(listing);
    }

    // 중고 등록
    @Transactional
    public void createListing(Long userId, UsedListingRequest request) {
        // 내 서재에 있는 책인지 확인
        Library library = libraryRepository.findByUserIdAndBookId(userId, request.getBookId())
                .orElseThrow(() -> CustomException.badRequest("보유하지 않은 도서입니다."));

        // 이미 중고 등록된 책인지 확인
        if (!library.isAvailable()) {
            throw CustomException.badRequest("이미 중고 등록 중인 도서입니다.");
        }

        // POINT 거래인데 가격이 없으면 에러
        if (request.getPriceType() == UsedListing.PriceType.POINT && request.getPointPrice() == null) {
            throw CustomException.badRequest("포인트 거래는 가격을 입력해주세요.");
        }

        User seller = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));

        // 서재에서 available 상태 변경
        library.markAsListed();

        // 중고 게시글 생성
        UsedListing listing = UsedListing.builder()
                .seller(seller)
                .book(book)
                .priceType(request.getPriceType())
                .pointPrice(request.getPointPrice())
                .build();

        usedListingRepository.save(listing);
    }

    // 중고 등록 취소
    @Transactional
    public void cancelListing(Long userId, Long listingId) {
        UsedListing listing = usedListingRepository.findById(listingId)
                .orElseThrow(() -> CustomException.notFound("중고 게시글을 찾을 수 없습니다."));

        if (!listing.getSeller().getId().equals(userId)) {
            throw CustomException.forbidden("본인의 게시글만 취소할 수 있습니다.");
        }
        if (listing.getStatus() != UsedListing.ListingStatus.ACTIVE) {
            throw CustomException.badRequest("취소할 수 없는 상태입니다.");
        }

        // 서재 상태 복원
        Library library = libraryRepository.findByUserIdAndBookId(userId, listing.getBook().getId())
                .orElseThrow(() -> CustomException.notFound("서재 정보를 찾을 수 없습니다."));
        library.markAsAvailable();

        listing.cancel();
    }

    // 포인트로 구매
    @Transactional
    public void purchaseWithPoint(Long buyerId, Long listingId) {
        UsedListing listing = usedListingRepository.findById(listingId)
                .orElseThrow(() -> CustomException.notFound("중고 게시글을 찾을 수 없습니다."));

        if (listing.getStatus() != UsedListing.ListingStatus.ACTIVE) {
            throw CustomException.badRequest("구매할 수 없는 상태입니다.");
        }
        if (listing.getPriceType() != UsedListing.PriceType.POINT) {
            throw CustomException.badRequest("포인트 거래 상품이 아닙니다.");
        }
        if (listing.getSeller().getId().equals(buyerId)) {
            throw CustomException.badRequest("본인의 게시글은 구매할 수 없습니다.");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        User seller = listing.getSeller();

        // 포인트 차감 & 적립
        buyer.deductPoint(listing.getPointPrice());
        seller.chargePoint(listing.getPointPrice());

        // 서재 소유권 변경
        Library sellerLibrary = libraryRepository.findByUserIdAndBookId(seller.getId(), listing.getBook().getId())
                .orElseThrow(() -> CustomException.notFound("판매자 서재 정보를 찾을 수 없습니다."));
        libraryRepository.delete(sellerLibrary);

        Library buyerLibrary = Library.builder()
                .user(buyer)
                .book(listing.getBook())
                .build();
        libraryRepository.save(buyerLibrary);

        // 거래 기록 생성
        Trade trade = Trade.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(seller)
                .tradeType(Trade.TradeType.POINT)
                .build();
        tradeRepository.save(trade);
        trade.accept();

        // 게시글 완료 처리
        listing.complete();
    }

    // 교환 신청
    @Transactional
    public Long requestExchange(Long buyerId, Long listingId, ExchangeRequest request) {
        UsedListing listing = usedListingRepository.findById(listingId)
                .orElseThrow(() -> CustomException.notFound("중고 게시글을 찾을 수 없습니다."));

        if (listing.getStatus() != UsedListing.ListingStatus.ACTIVE) {
            throw CustomException.badRequest("교환 신청할 수 없는 상태입니다.");
        }
        if (listing.getPriceType() != UsedListing.PriceType.EXCHANGE) {
            throw CustomException.badRequest("교환 거래 상품이 아닙니다.");
        }
        if (listing.getSeller().getId().equals(buyerId)) {
            throw CustomException.badRequest("본인의 게시글에는 교환 신청할 수 없습니다.");
        }

        // 신청자가 해당 책을 보유 중인지 확인
        Library offeredLibrary = libraryRepository.findByUserIdAndBookId(buyerId, request.getOfferedBookId())
                .orElseThrow(() -> CustomException.badRequest("보유하지 않은 도서입니다."));

        // 제시 책이 중고 등록 중이면 자동으로 해당 등록을 취소
        usedListingRepository.findBySellerIdAndBookIdAndStatus(
                buyerId, request.getOfferedBookId(), UsedListing.ListingStatus.ACTIVE)
            .ifPresent(existingListing -> {
                existingListing.cancel();
                offeredLibrary.markAsAvailable();
            });

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));

        Trade trade = Trade.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(listing.getSeller())
                .tradeType(Trade.TradeType.EXCHANGE)
                .offeredBookId(request.getOfferedBookId())
                .build();

        listing.reserve();
        return tradeRepository.save(trade).getId();
    }

    // 교환 수락
    @Transactional
    public void acceptExchange(Long sellerId, Long tradeId) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> CustomException.notFound("거래를 찾을 수 없습니다."));

        if (!trade.getSeller().getId().equals(sellerId)) {
            throw CustomException.forbidden("본인의 거래만 수락할 수 있습니다.");
        }
        if (trade.getStatus() != Trade.TradeStatus.PENDING) {
            throw CustomException.badRequest("수락할 수 없는 상태입니다.");
        }

        User buyer = trade.getBuyer();
        User seller = trade.getSeller();
        Long listingBookId = trade.getListing().getBook().getId();
        Long offeredBookId = trade.getOfferedBookId();

        // 서재 교환 처리
        Library sellerLibrary = libraryRepository.findByUserIdAndBookId(seller.getId(), listingBookId)
                .orElseThrow(() -> CustomException.notFound("판매자 서재 정보를 찾을 수 없습니다."));
        Library buyerLibrary = libraryRepository.findByUserIdAndBookId(buyer.getId(), offeredBookId)
                .orElseThrow(() -> CustomException.notFound("구매자 서재 정보를 찾을 수 없습니다."));

        libraryRepository.delete(sellerLibrary);
        libraryRepository.delete(buyerLibrary);

        Book listingBook = bookRepository.findById(listingBookId)
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));
        Book offeredBook = bookRepository.findById(offeredBookId)
                .orElseThrow(() -> CustomException.notFound("도서를 찾을 수 없습니다."));

        libraryRepository.save(Library.builder().user(buyer).book(listingBook).build());
        libraryRepository.save(Library.builder().user(seller).book(offeredBook).build());

        trade.accept();
        trade.getListing().complete();
    }

    // 교환 거절
    @Transactional
    public void rejectExchange(Long sellerId, Long tradeId) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> CustomException.notFound("거래를 찾을 수 없습니다."));

        if (!trade.getSeller().getId().equals(sellerId)) {
            throw CustomException.forbidden("본인의 거래만 거절할 수 있습니다.");
        }
        if (trade.getStatus() != Trade.TradeStatus.PENDING) {
            throw CustomException.badRequest("거절할 수 없는 상태입니다.");
        }

        trade.reject();
        trade.getListing().cancel();

        // 판매자 서재 상태 복원
        Library sellerLibrary = libraryRepository.findByUserIdAndBookId(
                sellerId, trade.getListing().getBook().getId())
                .orElseThrow(() -> CustomException.notFound("판매자 서재 정보를 찾을 수 없습니다."));
        sellerLibrary.markAsAvailable();
    }
}
