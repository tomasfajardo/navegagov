import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['pt', 'en'];
const defaultLocale = 'pt';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;

  // Validate locale
  if (!locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
