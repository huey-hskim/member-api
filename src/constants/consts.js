
const Config = {
  SECRET_SESSION: '##ndjt0lEhr7kxdmfRk23$',
  SECRET_REFRESH: '#0kfdk#kwcnjqh0kdy123$',
  ADMSECRET_SESSION: '#1#djemals0lfldhs23$',
  ADMSECRET_REFRESH: '#1#dpgpfkel0jfk6k23$',
  SESSION_EXPIRES_SEC: 3600      ,    // 1시간. 리프레시 없이 사용가능한 시간.
  REFRESH_EXPIRES_SEC: 86400 * 63,    // 63일. 2달에 한번 이라도 접속 하면 세션 유지됨.
  REFRESH_REFRESH_SEC: 86400 * 1 ,    // 1일. 리프레시 토큰 갱신 시간. 유효기간 내 갱신시간 초과 시 갱신. 즉 하루동안은 갱신안함.
};

const Settings = {
  TOKEN_KEY: 'access-token',
};

const Defaults = {
  name : 'Defaults'
};

const ConstantsAppUpdate = {
  none: 0,
  notify: 1,
  force: 2,
}

const ConstantsApp = {
  Update: ConstantsAppUpdate,
}

const ConstantsAgreementCode = {
  deny: 0,
  agree: 1,
}

const ConstantsUserStatus = {
  deleted: 0,
  deletePending:1,
  sleeping: 101,
  paused: 102,
  normal: 200,
}

const ConstantsUser = {
  Status: ConstantsUserStatus,
}

const ConstantsAdmin = {
  Status: ConstantsUserStatus,
}

const ConstantsPostboxStatus = {
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
}

const ConstantsPostbox = {
  Status: ConstantsPostboxStatus,
}

const Constants = {
  App: ConstantsApp,
  Admin: ConstantsAdmin,
  User: ConstantsUser,
  Agreement: ConstantsAgreementCode,
  Postbox: ConstantsPostbox,
}


//category 0
const ErrorCodeCommon = {
  invalidParameter  : 100,
  invalidStatus     : 101,
  unknown           : 999,
  _message: {
    invalidParameter  : '잘못된 요청입니다. 다시 시도해 주세요.',         // 입력오류
    invalidStatus     : '비정상적인 상태입니다.',                      // 수정할 수 없는 상태
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.', // 정의되지 않은 오류
  }
};

const ErrorCodeDatabase = {
  invalidParameter  : 1000,
  idDuplicated      : 1001,
  unknown           : 9999,
  _message: {
    invalidParameter  : '잘못된 요청입니다. 다시 시도해 주세요.',         // 입력오류
    idDuplicated      : '이미 등록된 정보입니다.',
    unknown           : '일시적인 오류가 발생했습니다. 다시 시도해 주세요.', // 정의되지 않은 오류
  }
};

//category 10000
const ErrorCodeAuth = {
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
};

//category 11000. 앱에 전달되지 않음. 로그인로깅용.
const ErrorCodeAudit = {
  invalidParameter  : 11001,
  notFoundUser      : 11002,
  invalidPasswd     : 11003,
  abnormalStatus    : 11004,
  failureTokenMake  : 11005,
  failureTokeRMake  : 11006,
  failureTokenIns   : 11007,
  notFoundSession   : 11008,
  unknown           : 11999,
};

//category 20000
const ErrorCodeUser = {
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
};

const ErrorCode = {
  success           : 0,
  unknown           : -1,
  Common            : ErrorCodeCommon,
  Auth              : ErrorCodeAuth,
  Audit             : ErrorCodeAudit,
  User              : ErrorCodeUser,
  Database          : ErrorCodeDatabase,
};

module.exports = {
  Config: Config,
  Settings: Settings,
  Defaults: Defaults,
  ErrorCode: ErrorCode,
  Constants: Constants,
};