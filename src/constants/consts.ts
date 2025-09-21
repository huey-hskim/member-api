// consts.ts

export const Config = {};

export const Settings = {};

export const Defaults = {
  name : 'Defaults',
};

// App Update Settings
export const ConstantsAppUpdate = {
  none: 0,
  notify: 1,
  force: 2,
} as const;

// App Constants
const ConstantsApp = {
  Update: ConstantsAppUpdate,
}

// Agreement Codes
export const ConstantsAgreementCode = {
  deny: 0,
  agree: 1,
} as const;

// User Status
export const ConstantsUserStatus = {
  deleted: 0,
  deletePending:1,
  sleeping: 101,
  paused: 102,
  normal: 200,
} as const;

// User Constants
export const ConstantsUser = {
  Status: ConstantsUserStatus,
}

export const ConstantsAdmin = {
  Status: ConstantsUserStatus,
}

// Postbox post Status
export const ConstantsPostboxStatus = {
  deleted: 0,
  edited: 100,
  test_ready: 200,
  test_ing: 201,
  test_error: 202,
  test_success: 300,
  live_ready: 400,
  live_ing: 401,
  live_error:402,
  live_success: 500,
} as const;

// Postbox Constants
export const ConstantsPostbox = {
  Status: ConstantsPostboxStatus,
}

// All Constants
export const Constants = {
  App: ConstantsApp,
  Admin: ConstantsAdmin,
  User: ConstantsUser,
  Agreement: ConstantsAgreementCode,
  Postbox: ConstantsPostbox,
}

// Error Codes
//category 0
export const ErrorCodeCommon = {
  invalidParameter  : 100,
  invalidStatus     : 101,
  unknown           : 999,
  _message: {
    invalidParameter  : '잘못된 요청입니다. 다시 시도해 주세요.',         // 입력오류
    invalidStatus     : '비정상적인 상태입니다.',                      // 수정할 수 없는 상태
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.', // 정의되지 않은 오류
  }
} as const;

export const ErrorCodeDatabase = {
  invalidParameter  : 1000,
  idDuplicated      : 1001,
  unknown           : 9999,
  _message: {
    invalidParameter  : '잘못된 요청입니다. 다시 시도해 주세요.',         // 입력오류
    idDuplicated      : '이미 등록된 정보입니다.',
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.', // 정의되지 않은 오류
  }
} as const;

//category 10000
export const ErrorCodeAuth = {
  hashingFailure    : 10100,
  leakedPasswd      : 10101,
  invalidPasswd     : 10201,
  internal          : 10900,
  unknown           : 10999,
  _message: {
    hashingFailure    : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',        // 비밀번호 암호화 생성 오류
    leakedPasswd      : '안전하지 않은 비밀번호가 사용되었습니다.',               // 안전하지 않은 비밀번호 사용
    invalidPasswd     : '이메일이나 비밀번호가 잘못되었습니다. 다시 확인해 주세요.',  // 비밀번호 오류
    internal          : '이메일이나 비밀번호가 잘못되었습니다. 다시 확인해 주세요.',  // 내부오류 - 토큰 생성 오류 등
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',        // 정의되지 않은 오류
  }
} as const;

//category 11000. 앱에 전달되지 않음. 로그인로깅용.
export const ErrorCodeAudit = {
  invalidParameter  : 11001,
  notFoundUser      : 11002,
  invalidPasswd     : 11003,
  abnormalStatus    : 11004,
  failureTokenMake  : 11005,
  failureTokeRMake  : 11006,
  failureTokenIns   : 11007,
  notFoundSession   : 11008,
  unknown           : 11999,
} as const;

//category 20000
export const ErrorCodeUser = {
  idDuplicated      : 20100,
  idDuplicatedCI    : 20110,
  invalidCI         : 20120,
  invalidBirth      : 20130,
  invalidBirth14    : 20132,
  notFoundUser      : 20200,
  notFoundExpert    : 20201,
  deleted           : 20300,
  deletePending     : 20301,
  sleeping          : 20401,
  paused            : 20402,
  staleInformation  : 20500,
  unknown           : 20999,
  _message: {
    idDuplicated      : '이미 가입된 정보입니다.',    // ID 중복
    idDuplicatedCI    : '이미 가입된 정보입니다.',    // CI 중복. 사용하지 않음. idDuplicated 사용.
    invalidCI         : '인증정보가 만료되었습니다. 다시 인증해 주세요.',   // CI 정보를 찾을 수 없음. 1시간내 가입.
    invalidBirth      : '생년월일을 확인할 수 없습니다.',
    invalidBirth14    : '만 14세 이상 이용 가능한 서비스 입니다.',
    notFoundUser      : '회원정보를 찾을 수 없습니다.',    // 회원 정보 없음
    notFoundExpert    : '회원정보를 찾을 수 없습니다.',    // 전문가 정보 없음
    deleted           : '로그인할 수 없는 아이디입니다. 고객센터로 문의해 주세요.',    // 탈퇴된 회원
    deletePending     : '로그인할 수 없는 아이디입니다. 고객센터로 문의해 주세요.',    // 탈퇴대기 회원
    sleeping          : '휴면 해제 후 로그인해 주세요.',    // 휴면회원
    paused            : '정지된 아이디입니다. 고객센터로 문의해 주세요.',    // 정지회원
    staleInformation  : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',    // 이미 다른 정보로 변경된 상태
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',    // 정의되지 않은 오류
  }
} as const;

export const ErrorCode = {
  success           : 0,
  unknown           : -1,
  Common            : ErrorCodeCommon,
  Auth              : ErrorCodeAuth,
  Audit             : ErrorCodeAudit,
  User              : ErrorCodeUser,
  Database          : ErrorCodeDatabase,
};
