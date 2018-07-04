import { Dimensions, Platform } from 'react-native';

export const global_screen_width = Dimensions.get('window').width;
export const global_screen_height = Dimensions.get('window').height;
export const global_grass_height = 100;
export const global_size2color = {'-3': 'limegreen', '-2': 'purple', '-1': 'darkred',
          '0': 'blue', '1': 'green', '2': 'orange', '3': 'cyan'};
export const global_size2symbol = {'-3': '-', '-2': '^', '-1': 'o', '0': '|',
               '1': '\u25A1', '2': '\u25EB', '3': '\u25E7'};

var ua = (Platform.OS === 'web') ? window.navigator.userAgent : false;
export const global_is_mobile = !ua ? false : (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua.toLowerCase()));
export const global_is_safari = !ua ? false : (navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS'));
