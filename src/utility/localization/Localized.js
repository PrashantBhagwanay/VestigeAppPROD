// ES6 module syntax
import LocalizedStrings from 'react-native-localization';

// Import all locales
import en from './en.json';
import hi from './hi.json';
import pb from './pb.json';
import bng from './bng.json';
import fr from './fr.json';


export const languages = [
  {language:'en', title: 'English'},
  {language:'hi', title: 'हिंदी'},
  {language:'pb', title: 'ਪੰਜਾਬੀ'},
  {language:'bng', title: 'বাংলা'},
  {language:'fr', title: 'French'}
]

export const strings = new LocalizedStrings({
  en: en,
  hi: hi,
  pb: pb,
  bng: bng,
  fr:fr,
});

export const setLanguage = (language) => {
  strings.setLanguage(language)
}

export const getLanguage = () => {
  return strings.getLanguage();
}

export const setImages = () => console.log(en);
