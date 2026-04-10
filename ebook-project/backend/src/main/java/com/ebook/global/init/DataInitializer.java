package com.ebook.global.init;

import com.ebook.domain.mybook.entity.MyBook;
import com.ebook.domain.mybook.repository.MyBookRepository;
import com.ebook.domain.user.entity.User;
import com.ebook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 앱 시작 시 저작권 만료 도서 10권을 시드 데이터로 추가합니다.
 * 이미 system@ebook.com 계정이 존재하면 스킵합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final MyBookRepository myBookRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SYSTEM_EMAIL = "system@ebook.com";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(SYSTEM_EMAIL)) {
            log.info("시드 데이터가 이미 존재합니다. 스킵합니다.");
            return;
        }

        // 시스템 계정 생성
        User system = User.builder()
                .email(SYSTEM_EMAIL)
                .password(passwordEncoder.encode("system_password_not_used"))
                .nickname("EBookMarket")
                .build();
        userRepository.save(system);

        // 저작권 만료 도서 10권 (Project Gutenberg 기반)
        List<SeedBook> seeds = List.of(
            new SeedBook("파우스트",
                "요한 볼프강 폰 괴테",
                "인류 문학의 최고 걸작 중 하나. 지식을 향한 인간의 탐구와 악마 메피스토펠레스와의 계약을 그린 독일 문학의 정수.",
                "https://www.gutenberg.org/cache/epub/14591/pg14591.cover.medium.jpg",
                "https://www.gutenberg.org/files/14591/14591-0.txt"),
            new SeedBook("데미안",
                "헤르만 헤세",
                "자아 발견의 여정을 그린 성장 소설. '새는 알에서 나오려고 투쟁한다'는 유명한 구절로 시작되는 철학적 소설.",
                "https://www.gutenberg.org/cache/epub/24455/pg24455.cover.medium.jpg",
                "https://www.gutenberg.org/files/24455/24455-0.txt"),
            new SeedBook("변신",
                "프란츠 카프카",
                "어느 날 아침 벌레로 변해버린 그레고르 잠자의 이야기. 현대인의 소외와 부조리를 상징적으로 표현한 카프카의 대표작.",
                "https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg",
                "https://www.gutenberg.org/files/5200/5200-0.txt"),
            new SeedBook("노인과 바다",
                "어니스트 헤밍웨이",
                "늙은 어부 산티아고가 홀로 바다에서 거대한 청새치와 사투를 벌이는 이야기. 인간의 용기와 투지를 담은 노벨상 수상작.",
                "https://www.gutenberg.org/cache/epub/2778/pg2778.cover.medium.jpg",
                "https://www.gutenberg.org/files/2778/2778-0.txt"),
            new SeedBook("어린 왕자",
                "앙투안 드 생텍쥐페리",
                "사막에 불시착한 조종사와 소행성에서 온 어린 왕자의 만남. 어른들에게 잊혀진 어린 시절의 순수함과 사랑을 일깨우는 작품.",
                "https://www.gutenberg.org/cache/epub/61/pg61.cover.medium.jpg",
                "https://www.gutenberg.org/files/61/61-0.txt"),
            new SeedBook("죄와 벌",
                "표도르 도스토예프스키",
                "가난한 법학도 라스콜니코프가 '비범한 인간은 죄를 저질러도 된다'는 이론을 실험하는 심리 소설의 걸작.",
                "https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg",
                "https://www.gutenberg.org/files/2554/2554-0.txt"),
            new SeedBook("오만과 편견",
                "제인 오스틴",
                "19세기 영국 사회를 배경으로 엘리자베스 베넷과 다아시의 사랑 이야기. 오만과 편견을 극복하는 과정을 위트 있게 그린 명작.",
                "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
                "https://www.gutenberg.org/files/1342/1342-0.txt"),
            new SeedBook("모비딕",
                "허먼 멜빌",
                "에이해브 선장과 흰 고래 모비딕의 집착과 복수를 그린 미국 문학의 걸작. 인간의 광기와 자연의 힘을 서사적으로 묘사.",
                "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
                "https://www.gutenberg.org/files/2701/2701-0.txt"),
            new SeedBook("1984",
                "조지 오웰",
                "전체주의 국가 오세아니아를 배경으로 '빅 브라더'의 감시 사회를 그린 디스토피아 소설. 현대 사회에 강력한 경고를 던지는 작품.",
                "https://www.gutenberg.org/cache/epub/71303/pg71303.cover.medium.jpg",
                "https://www.gutenberg.org/files/71303/71303-0.txt"),
            new SeedBook("동물농장",
                "조지 오웰",
                "동물들이 인간에게 반란을 일으켜 스스로 농장을 운영하는 우화. 전체주의와 권력의 부패를 풍자적으로 그린 정치 소설.",
                "https://www.gutenberg.org/cache/epub/67979/pg67979.cover.medium.jpg",
                "https://www.gutenberg.org/files/67979/67979-0.txt")
        );

        for (SeedBook s : seeds) {
            MyBook book = MyBook.builder()
                    .title(s.title())
                    .description(s.author() + " 저. " + s.description())
                    .imageUrl(s.imageUrl())
                    .fileUrl(s.fileUrl())
                    .owner(system)
                    .purchasedFromSite(true)  // 서점 구매 = 교환 가능
                    .build();
            myBookRepository.save(book);
        }

        log.info("시드 데이터 10권 추가 완료.");
    }

    private record SeedBook(String title, String author, String description,
                             String imageUrl, String fileUrl) {}
}
