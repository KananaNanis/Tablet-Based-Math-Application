import React from 'react'
import { View, StyleSheet } from 'react-native'
import Tile, { animals, default_pixels_per_cm } from './Tile'
//import { global_screen_width, global_screen_height} from './Workspace'

const size11x17 = [1471, 2333]
const size8p5x11 = [1112, 1471]
const pixels_per_cm = 56.77

const PrintFigure = ({ scale_factor }) => {
  const scale_down_for_laptop = false;
  const show_purple_border = true;
  const use11x17 = true;
  const landscape = false;
  const rotate_whole_page = false;

  let content = []
  const extra_scale = pixels_per_cm / default_pixels_per_cm
  let anim1 = {  // first animal figure positions
    "ladybug": [5, 5],
    "mouse": [5, 100],
    "fish": [5, 1100],
    "kitty": [1100, 1600],
    "puppy": [1100, 1950],
    "rhino": [5, 1300],
    "dragon": [170, 5],
    "giraffe": [795, 5],
  }
  let anim2 = {
    "crab": [1020, 5],
    "duck": [5, 1900],
    "pig": [700, 1850],
    "horse": [5, 930],
    "moose": [5, 5],
  }
  let anim3 = {
    "chimpanzee": [1100, 1600],
    "bear": [600, 1600],
    "chick": [5, 1600],
    "sloth": [700, 830],
    "deer": [5, 850],
    "bull": [660, 5],
    "unicorn": [5, 5],
  }
  const anim = anim3
  for (name in anim)
    content.push(<Tile name={name} position={anim[name]} extra_scale={extra_scale} key={name} />)
  const borderWidth = show_purple_border ? 1 : 0
  let width, height;
  if (use11x17) {
    if (landscape) {
      width = size11x17[1]
      height = size11x17[0]
    } else {
      width = size11x17[0]
      height = size11x17[1]
    }
  } else {  // use 8.5 x 11
    if (landscape) {
      width = size8p5x11[1]
      height = size8p5x11[0]
    } else {
      width = size8p5x11[0]
      height = size8p5x11[1]
    }
  }
  let transform = [];
  if (scale_down_for_laptop) {
    // temporary scale factor, so that I can see what the eventual result
    //   looks like:
    if (use11x17) transform.push({ 'scale': 0.28 })
    else {
      if (landscape) transform.push({ 'scale': 0.58 })
      else transform.push({ 'scale': 0.38 })
    }
  }
  if (rotate_whole_page) {
    transform.push({ 'rotate': '90deg' })
    transform.push({ 'translateY': -1 * height });
  }
  return <View style={[styles.print_figure, { width, height, transform, borderWidth }]}>
    {content}
  </View>
}

const styles = StyleSheet.create({
  print_figure: {
    position: 'absolute',
    borderColor: 'purple',
    transformOrigin: 'top left'
  },
})

export default PrintFigure