export const ssr = false;
export const prerender = true;

import { init, register, waitLocale } from 'svelte-i18n';

const defaultLocale = 'en';

register('en', () => import('$lib/i18n/en.json'));
register('zh-TW', () => import('$lib/i18n/zh-TW.json'));

export const load = async () => {
  init({
    fallbackLocale: defaultLocale,
    initialLocale: 'en', 
  });

  await waitLocale('zh-TW');
};