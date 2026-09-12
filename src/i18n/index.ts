import { en } from './en';
import { ta } from './ta';
import type { Language } from '../domain';

export type { TranslationKeys } from './en';
export { en, ta };

export function getTranslations(language: Language) {
  return language === 'ta' ? ta : en;
}
