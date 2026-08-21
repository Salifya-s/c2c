import {getRequestConfig} from 'next-intl/server';

import {routing} from './routing';

export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;
  const messages = (await import('../messages/en.json')).default;

  return {
    locale,
    messages
  };
});
