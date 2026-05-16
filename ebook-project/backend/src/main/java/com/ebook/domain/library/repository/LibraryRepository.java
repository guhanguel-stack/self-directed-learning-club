package com.ebook.domain.library.repository;

import com.ebook.domain.library.entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryRepository extends JpaRepository<Library, Long> {
    List<Library> findByUserId(Long userId);
    List<Library> findByUserIdAndBookId(Long userId, Long bookId);
    Optional<Library> findFirstByUserIdAndBookIdAndIsAvailable(Long userId, Long bookId, boolean isAvailable);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
