import { Dimensions, Platform } from 'react-native';

export const screen_width = Dimensions.get('window').width;
export const screen_height = Dimensions.get('window').height;
export const grass_height = 100;
export const size2value = {'m': .001, 'f': .01, 'z': 0.1, 'u': 1,
               't': 10, 'h': 100, 'p': 1000};
export const size2color = {'m': 'limegreen', 'f': 'purple', 'z': 'darkred', 'u': 'blue', 't': 'green', 'h': 'orange', 'p': 'cyan'};
export const size2symbol = {'m': '-', 'f': '^', 'z': 'o', 'u': '|',
               't': '\u25A1', 'h': '\u25EB', 'p': '\u25E7'};
export var default_scaleFactor = 520;

export var in_exercise = false; // state info...

var ua = (Platform.OS === 'web') ? window.navigator.userAgent : false;
export const is_mobile = !ua ? false : (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua.toLowerCase()));
export const is_safari = !ua ? false : (navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS'));
