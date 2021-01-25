export enum HTTP_STATUS_CODE {
  Ok = 200,
  Client_Error = 400,
  Unauthorized = 401,
  Forbidden = 403,
  Server_Error = 500,
  Validation_Error = 422, // TODO, change to 400, at client
}

export enum REQUEST_PATH {
  Body = 'body',
  Params = 'params',
  QueryString = 'querystring',
}
