# Migration: Create users table
# Date: 2025-09-06 02:01:00
# Description: This migration creates the users table with necessary fields and constraints.

# drop table users;
CREATE TABLE IF NOT EXISTS users
(
    no              int             NOT NULL    AUTO_INCREMENT                  COMMENT 'PK',
    id              VARCHAR(100)    NOT NULL                                    COMMENT '로그인아이디(이메일)',
#     role_no         int             NOT NULL    DEFAULT 5                       COMMENT 'roles.no',
#     company_no      int             NULL                                        COMMENT 'companies.no',
    status          int             NOT NULL    DEFAULT 100                     COMMENT '상태. 100:대기, 200:활성, 300:정지, 0:탈퇴',
    created_at      DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    updated_at      DATETIME        NULL        DEFAULT now() ON UPDATE now()   COMMENT '수정일',
    deleted_at      DATETIME        NULL        DEFAULT NULL                    COMMENT '삭제일',
    PRIMARY KEY (no),
    UNIQUE KEY uq_users_email (id)
) COMMENT '사용자 테이블';

# drop table user_infos;
CREATE TABLE IF NOT EXISTS user_infos
(
    user_no          int             NOT NULL                                    COMMENT 'users.no',
    name             VARCHAR(100)    NOT NULL                                    COMMENT '이름',
    email            VARCHAR(100)    NOT NULL                                    COMMENT '사용자 이메일',
    created_at       DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    updated_at       DATETIME        NULL        DEFAULT now() ON UPDATE now()   COMMENT '수정일',
    PRIMARY KEY (user_no),
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE
) COMMENT '사용자 추가 정보 테이블';

# drop table user_shadows;
CREATE TABLE IF NOT EXISTS user_shadows
(
    user_no          int             NOT NULL                                    COMMENT 'users.no',
    passwd           VARCHAR(100)    NOT NULL                                    COMMENT '비밀번호. bcrypt 암호화',
    prev             VARCHAR(100)    NULL                                        COMMENT '사용자 이메일',
    created_at       DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    updated_at       DATETIME        NULL        DEFAULT now() ON UPDATE now()   COMMENT '수정일',
    PRIMARY KEY (user_no),
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE
) COMMENT '사용자 인증 정보 테이블';

# drop table user_sessions;
CREATE TABLE IF NOT EXISTS user_sessions
(
    no               int             NOT NULL    AUTO_INCREMENT                  COMMENT 'PK',
    user_no          int             NOT NULL                                    COMMENT 'users.no',
    hash             VARCHAR(400)    NOT NULL                                    COMMENT 'session hash',
    created_at       DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    expires_at       DATETIME        NULL                                        COMMENT '만료일. (예측)',
    PRIMARY KEY (no),
    INDEX ix_user_sessions_hash (hash, user_no)
) COMMENT '사용자 세션 테이블';

# drop view vw_users;
CREATE VIEW vw_users AS
    SELECT  u.no as user_no,
            u.id,
#             r.name as role,
#             u.company_no,
            u.status,
            ui.name,
            ui.email,
            u.created_at as created_at,
            u.updated_at as updated_at
    FROM    users as u
            LEFT JOIN user_infos as ui on u.no = ui.user_no
#             LEFT JOIN roles as r on u.role_no=r.no
;
# select * from vw_users;
## end of vw_users

# drop table user_passkey_challenges;
CREATE TABLE user_passkey_challenges
(
    no              int             NOT NULL    AUTO_INCREMENT                  COMMENT 'PK',
    user_no         int             NOT NULL                                    COMMENT 'users.no',
    challenge       VARCHAR(255)    NOT NULL                                    COMMENT 'Passkey Challenge (Base64url)',
    hash            VARCHAR(255)    NOT NULL                                    COMMENT 'sha256(user_no,challenge,nonce,secret)',
    created_at      DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    expires_at      DATETIME        NOT NULL                                    COMMENT '만료일',
    PRIMARY KEY (no),
    INDEX ix_user_passkey_challenges_user_no (user_no),
    INDEX ix_user_passkey_challenges_hash (hash),
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE
) COMMENT '사용자 패스키 챌린지 테이블';

# drop table user_passkeys;
CREATE TABLE user_passkeys
(
    no              int             NOT NULL    AUTO_INCREMENT                  COMMENT 'PK',
    user_no         int             NOT NULL                                    COMMENT 'users.no',
    credential_id   VARCHAR(255)    NOT NULL                                    COMMENT 'Passkey Credential ID (Base64url)',
    public_key      TEXT            NOT NULL                                    COMMENT 'Passkey Public Key (COSEKey)',
    sign_count      BIGINT          NOT NULL    DEFAULT 0                       COMMENT 'WebAuthn Sign Counter',
    transports      JSON            NULL                                        COMMENT '클라이언트 인증기 전송 방법 (usb, nfc, ble, internal)',
    fmt             VARCHAR(50)     NULL                                        COMMENT '패스키 포맷 ("packed", "fido-u2f", "android-safetynet", "android-key", "apple")',
    aaguid          VARCHAR(36)     NULL                                        COMMENT 'Authenticator Attestation GUID',
    created_at      DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    updated_at      DATETIME        NULL        DEFAULT now() ON UPDATE now()   COMMENT '수정일',
    PRIMARY KEY (no),
    UNIQUE INDEX uix_user_passkeys_credential_id (credential_id),
    INDEX ix_user_passkeys_user_no (user_no),
    FOREIGN KEY (user_no) REFERENCES users(no) ON DELETE CASCADE
) COMMENT '사용자 패스키 테이블';
