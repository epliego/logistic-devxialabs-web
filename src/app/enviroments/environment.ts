declare const __URL_BASE_NESTJS__: string;
declare const __URL_BASE_ANGULAR__: string;
declare const __INTERNAL_SECRET_ACCESS_TOKEN__: string;
declare const __INTERNAL_ACCESS_TOKEN_EXPIRES_IN__: string;

export const environment = {
  // JWT CONFIGURATION
  INTERNAL_SECRET_ACCESS_TOKEN:
    __INTERNAL_SECRET_ACCESS_TOKEN__ || '1nt3rn4ls3cr3tk3y4cc3ss4p1k3yD3vx14l4bs;',
  INTERNAL_ACCESS_TOKEN_EXPIRES_IN: __INTERNAL_ACCESS_TOKEN_EXPIRES_IN__ || '25200s',

  // URL BASE NESTJS
  URL_BASE_NESTJS: __URL_BASE_NESTJS__ || 'http://localhost:3000',

  // URL BASE ANGULAR
  URL_BASE_ANGULAR: __URL_BASE_ANGULAR__ || 'http://localhost:4200/',
};
