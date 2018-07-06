import { Platform } from 'react-native';

var ua = (Platform.OS === 'web') ? window.navigator.userAgent : false;
export const global_is_mobile = !ua ? false : (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua.toLowerCase()));
export const global_is_safari = !ua ? false : (navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS'));