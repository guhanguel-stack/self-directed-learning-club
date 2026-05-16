package com.ebook.domain.user.dto;

import com.ebook.domain.user.entity.User;
import lombok.Getter;

@Getter
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private Long pointBalance;

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.pointBalance = user.getPointBalance();
    }
}
