package com.ebook.domain.library.repository;

import com.ebook.domain.library.entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryRepository extends JpaRepository<Library, Long> {
    List<Library> findByUserId(Long userId);
    Optional<Library> findByUserIdAndBookId(Long userId, Long bookId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
