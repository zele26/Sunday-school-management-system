// src/hooks/useLanguage.js
import { useIntl } from 'react-intl';
import { useLanguageContext } from '../providers/LanguageProvider';

export const useLanguage = () => {
  return useLanguageContext();
};

export { useIntl };
export default useLanguage;
