
# drop table roles;
CREATE TABLE roles
(
    no              int             not null    auto_increment          comment 'PK',
    weight          int             not null                            comment 'role weight. lower is more privileged',
    company_no      int             null                                comment 'company no. null means default role',
    name            varchar(255)    not null                            comment 'role name. platform_admin, platform_manager, company_admin, company_user, user',
    description     varchar(500)    null                                comment 'role description',
    created_at      datetime        not null    default now()           comment '생성일',
    created_by      int             null                                comment 'created by user no',
    PRIMARY KEY (no),
    INDEX ix_roles_name (name)
) comment '권한 역할 테이블';

# drop table permissions;
CREATE TABLE permissions
(
    no              int             not null    auto_increment          comment 'PK',
    name            varchar(255)    not null                            comment 'role name',
    description     varchar(500)    null                                comment 'role description',
    created_at      datetime        not null    default now()           comment '생성일',
    PRIMARY KEY (no),
    INDEX ix_permissions_name (name)
) comment '권한 테이블';

# drop table role_permissions;
CREATE TABLE role_permissions
(
    no              int             not null    auto_increment          comment 'PK',
    role_no         int             not null                            comment 'roles.no',
    permission_no   int             not null                            comment 'permissions.no',
    crud            char(10)        not null                            comment 'CRUD. read, write, update, delete',
    created_at      datetime        not null    default now()           comment '생성일',
    PRIMARY KEY (no),
    INDEX ix_role_permissions_role (role_no)
) comment '권한 테이블';

# drop table companies;
CREATE TABLE IF NOT EXISTS companies
(
    no              int             NOT NULL    AUTO_INCREMENT                  COMMENT 'PK',
    name            VARCHAR(100)    NOT NULL                                    COMMENT '회사명',
    code            VARCHAR(50)     NOT NULL                                    COMMENT '회사코드',
    status          int             NOT NULL    DEFAULT 100                     COMMENT '상태. 100:대기, 200:활성, 300:정지, 0:삭제',
    created_at      DATETIME        NOT NULL    DEFAULT now()                   COMMENT '생성일',
    updated_at      DATETIME        NULL        DEFAULT now() ON UPDATE now()   COMMENT '수정일',
    deleted_at      DATETIME        NULL        DEFAULT NULL                    COMMENT '삭제일',
    PRIMARY KEY (no),
    UNIQUE KEY uq_companies_name (name)
) COMMENT '회사 테이블';


# users 테이블에 role_no 컬럼 추가
ALTER TABLE users ADD COLUMN role_no int not null default 5 COMMENT 'roles.no 사용자 권한';
ALTER TABLE users ADD COLUMN company_no int null COMMENT 'companies.no 회사번호' after role_no;


# 뷰 업데이트
# drop view vw_users;
CREATE VIEW vw_users AS
SELECT  u.no as user_no,
        u.id,
        r.name as role,
        u.company_no,
        u.status,
        ui.name,
        ui.email,
        u.created_at as created_at,
        u.updated_at as updated_at
FROM    users as u
        LEFT JOIN user_infos as ui on u.no = ui.user_no
        LEFT JOIN roles as r on u.role_no=r.no
;

-- Insert default roles
INSERT INTO roles (no, weight, company_no, name, description)
VALUES
(1, 1, NULL, 'platform_admin', '플랫폼 관리자. 모든 권한 보유'),
(2, 100, NULL, 'platform_manager', '플랫폼 매니저. 대부분 권한 보유'),
(3, 1000, NULL, 'company_admin', '회사 관리자. 회사 내 모든 권한 보유'),
(4, 2000, NULL, 'company_user', '회사 사용자. 제한된 권한 보유'),
(5, 3000, NULL, 'user', '일반 사용자. 최소 권한 보유'),
(101, 1000, 1001, 'company_admin', '1001 회사 관리자. 회사 내 모든 권한 보유'),
(102, 2000, 1001, 'company_user', '1001 회사 사용자. 제한된 권한 보유')
;

# -- Insert default permissions
# INSERT INTO permissions (no, name, description)
# VALUES
# (1, 'dashboard', '대시보드'),
# (2, 'lubricators', '주유기 관리'),
# (3, 'groups', '주유기그룹 관리'),
# (4, 'gateways', '게이트웨이 관리'),
# (5, 'reports', '보고서 관리'),
# (6, 'companies', '회사 관리'),
# (7, 'users', '사용자 관리'),
# (8, 'roles', '역할 관리'),
# (9, 'settings', '설정 관리')
# ;
#
# # -- Insert default role_permissions
# INSERT INTO role_permissions (role_no, permission_no, crud)
# VALUES
# -- platform_admin: all permissions
# (1, 1, 'create'), (1, 1, 'read'), (1, 1, 'update'), (1, 1, 'delete'),
# (1, 2, 'create'), (1, 2, 'read'), (1, 2, 'update'), (1, 2, 'delete'),
# (1, 3, 'create'),
# (1, 3, 'read'),
# (1, 3, 'update'),
# (1, 3, 'delete'),
# (1, 4, 'create'),
# (1, 4, 'read'),
# (1, 4, 'update'),
# (1, 4, 'delete'),
# (1, 5, 'create'),
# (1, 5, 'read'),
# (1, 5, 'update'),
# (1, 5, 'delete'),
# (1, 6, 'create'),
# (1, 6, 'read'),
# (1, 6, 'update'),
# (1, 6, 'delete'),
# (1, 7, 'create'),
# (1, 7, 'read'),
# (1, 7, 'update'),
# (1, 7, 'delete'),
# (1, 8, 'create'),
# (1, 8, 'read'),
# (1, 8, 'update'),
# (1, 8, 'delete'),
# (1, 9, 'create'),
# (1, 9, 'read'),
# (1, 9, 'update'),
# (1, 9, 'delete'),
# -- platform_manager: read and update permissions
# (9, 1, 'create'),
# (9, 1, 'read'),
# (9, 1, 'update'),
# # (9, 1, 'delete'),
# (9, 2, 'create'),
# (9, 2, 'read'),
# (9, 2, 'update'),
# # (9, 2, 'delete'),
# (9, 3, 'create'),
# (9, 3, 'read'),
# (9, 3, 'update'),
# # (9, 3, 'delete'),
# (9, 4, 'create'),
# (9, 4, 'read'),
# (9, 4, 'update'),
# # (9, 4, 'delete'),
# (9, 5, 'create'),
# (9, 5, 'read'),
# (9, 5, 'update'),
# # (9, 5, 'delete'),
# (9, 6, 'create'),
# (9, 6, 'read'),
# (9, 6, 'update'),
# # (9, 6, 'delete'),
# (9, 7, 'create'),
# (9, 7, 'read'),
# (9, 7, 'update'),
# # (9, 7, 'delete'),
# (9, 8, 'create'),
# (9, 8, 'read'),
# (9, 8, 'update'),
# # (9, 8, 'delete'),
# (9, 9, 'create'),
# (9, 9, 'read'),
# (9, 9, 'update'),
# # (9, 9, 'delete'),
# -- company_admin: read and update permissions for company-related modules
# (3, 1, true, true, true, true),
# (3, 2, true, true, true, true),
# (3, 3, true, true, true, true),
# (3, 4, false, true, true, true),
# (3, 5, true, true, true, true),
# (3, 6, true, true, true, true),
# (3, 7, true, true, true, true),
# (3, 8, true, true, true, true),
# (3, 9, true, true, true, true),
# -- company_user: read permissions only for company-related modules
# (4, 1, false, true, false, false),
# (4, 2, false, true, false, false),
# (4, 3, false, true, true, false),
# (4, 4, false, true, true, false),
# (4, 5, false, false, false, false),
# (4, 6, false, false, false, false),
# (4, 7, false, false, false, false),
# (4, 8, false, false, false, false),
# (4, 9, false, false, false, false),
# -- 1001 company_admin: read and update permissions for company-related modules
# (101, 1, true, true, true, true),
# (101, 2, true, true, true, true),
# (101, 3, true, true, true, true),
# (101, 4, false, true, true, true),
# (101, 5, true, true, true, true),
# (101, 6, true, true, true, true),
# (101, 7, true, true, true, true),
# (101, 8, true, true, true, true),
# (101, 9, true, true, true, true),
# -- 1001 company_user: read permissions only for company-related modules
# (102, 1, false, true, false, false),
# (102, 2, false, true, false, false),
# (102, 3, false, true, true, false),
# (102, 4, false, true, true, false),
# (102, 5, false, false, false, false),
# (102, 6, false, false, false, false),
# (102, 7, false, false, false, false),
# (102, 8, false, false, false, false),
# (102, 9, false, false, false, false)
# ;

# 퍼미션 넘 복잡하다... 지금 안함...
# SELECT  users.*,
#         user_infos.*,
#         GROUP_CONCAT(DISTINCT roles.name) as role_names,
#         GROUP_CONCAT(DISTINCT CONCAT(p.name, rp.c, rp.r, rp.u, rp.d)) as permission_names
# FROM    users
#         LEFT JOIN user_infos on users.no = user_infos.user_no
#         LEFT JOIN user_roles on users.no = user_roles.user_no
#         LEFT JOIN roles on user_roles.role_no = roles.no
#         LEFT JOIN role_permissions as rp on user_roles.role_no = rp.role_no
#         LEFT JOIN permissions as p on rp.permission_no = p.no
# GROUP BY users.no
# ;

/*
SELECT  u.*,
        ui.*,
        r.name as role_name
FROM    users as u
        LEFT JOIN user_infos as ui on u.no = ui.user_no
        LEFT JOIN roles as r on u.role_no = r.no
;

SELECT  u.*,
        ui.*,
        (SELECT name FROM roles WHERE no=u.role_no) as role
FROM    users as u
        LEFT JOIN user_infos as ui on u.no = ui.user_no
;

SELECT  u.*,
        (SELECT name FROM roles WHERE no=u.role_no) as role
FROM    users as u
;
*/
