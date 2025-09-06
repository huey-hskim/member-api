CREATE TABLE IF NOT EXISTS users (
                       no BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'PK',
                       name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
                       email VARCHAR(200) NOT NULL COMMENT '사용자 이메일',
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
                       updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
                       deleted_at DATETIME NULL DEFAULT NULL COMMENT '삭제일 (soft delete)',

                       PRIMARY KEY (no),
                       UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
