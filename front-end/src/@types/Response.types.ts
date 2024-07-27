/**
 * EmptyData    :   �ŭȦ���� (��ܸӰѼƬ� null)
 */
export enum RequestParameterFormat {
  EmptyData = 'EMPTY_DATA'
}

/**
* �^�Ǫ���Ƶ��c
*/
export interface ResultData {
  loadType: LoadType;   
  data: Object[];
}

/**
 * LoadType codes
 */
export enum LoadType {
  SUCCEED             = 1000,     // ���\�^��
  UNAUTHORIZED        = 1001,     // ���n�J�νШD header �S�a sessionID
  FORBIDDEN           = 1002,     // �� sessionID �S�v���ШD
  PARAMETER_ERROR     = 1003,     // �ШD�Ѽƿ��~
  PATH_ERROR          = 1004,     // �ШD���|���~
  DISABLE             = 1005,     // �� API �w�Q�T��

  SERVER_ERROR        = 1050,     // ���A�����~ (�������~)
  QUERY_FAILED        = 1051,     // ��Ʈw�d�߿��~ (�������~)


  DATA_EXISTED        = 1100,     // ��Ʈw�w�s�b�Ӹ��
  DATA_NOT_FOUND      = 1101,     // ��Ʈw�����Ӹ��
  FK_NOT_FOUND        = 1103,     // �ޥΪ��~�䥼��� (�|�h�X missingFK ��)
  ROW_IS_REFERENCED   = 1104,     // ������Ƥw�Q�ޥ�


  // TYPE_ACCOUNT = 2xxx
  ACCOUNT_EXISTS      = 2001,     // �b���w�s�b
  ACCOUNT_NOT_EXISTS  = 2002,     // �b�����s�b
  OLD_PASSWORD_ERROR  = 2003,     // �±K�X���~  (���K�X api �|�X�{)


  // TYPE_SESSION = 3xxx
  BLOCKED_LOGIN       = 3000,     // ���յn�J�Ӧh�� ��w�@�q�ɶ�
  FAILED_LOGIN        = 3001,     // �n�J���� (�b���αK�X���~)
  SESSION_EXISTS      = 3003,     // �ШD�ɤw�a�J���Ī� sessionId ���L�n�J
  SESSION_INVALID     = 3004,     // �ШD�ɱa�J�� sessionId �L�� (�i�ජ�m�Ӥ[�L���F), �i���w�V�ܵn�J����


  // TYPE_MAIL = 4xxx
  SEND_FAIL           = 4000      // �o�e�H�󥢱�
}