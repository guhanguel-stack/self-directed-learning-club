package com.ebook.domain.user.service;

import com.ebook.domain.user.dto.*;
import com.ebook.domain.user.entity.User;
import com.ebook.domain.user.repository.UserRepository;
import com.ebook.global.exception.CustomException;
import com.ebook.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw CustomException.badRequest("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw CustomException.badRequest("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        userRepository.save(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> CustomException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw CustomException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtProvider.createAccessToken(user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        // Redis 사용 가능 시 refresh token 저장, 불가 시 stateless JWT로 동작
        try {
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_PREFIX + user.getId(),
                    refreshToken,
                    7, TimeUnit.DAYS
            );
        } catch (Exception e) {
            log.warn("Redis 미연결 - stateless JWT 모드로 동작합니다: {}", e.getMessage());
        }

        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional
    public void logout(Long userId) {
        try {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + userId);
        } catch (Exception e) {
            log.warn("Redis 미연결 - 서버측 토큰 삭제 생략: {}", e.getMessage());
        }
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw CustomException.unauthorized("유효하지 않은 토큰입니다.");
        }

        Long userId = jwtProvider.getUserId(refreshToken);

        // Redis 사용 가능 시 저장된 토큰과 비교, 불가 시 JWT 서명 검증만으로 처리
        try {
            String savedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + userId);
            if (savedToken != null && !savedToken.equals(refreshToken)) {
                throw CustomException.unauthorized("만료된 토큰입니다. 다시 로그인해주세요.");
            }
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Redis 미연결 - JWT 서명 검증만으로 reissue 처리: {}", e.getMessage());
        }

        String newAccessToken = jwtProvider.createAccessToken(userId);
        String newRefreshToken = jwtProvider.createRefreshToken(userId);

        try {
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_PREFIX + userId,
                    newRefreshToken,
                    7, TimeUnit.DAYS
            );
        } catch (Exception e) {
            log.warn("Redis 미연결 - 신규 refresh token 저장 생략: {}", e.getMessage());
        }

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        return new UserResponse(user);
    }

    @Transactional
    public void chargePoint(Long userId, Long amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("사용자를 찾을 수 없습니다."));
        user.chargePoint(amount);
    }
}
