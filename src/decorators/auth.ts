import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data, host) => {
  const [req] = host.getArgs();
  return req.currentUser;
});

export const AuthUser = createParamDecorator((data, host) => {
  const [req] = host.getArgs();
  return req.user;
});
