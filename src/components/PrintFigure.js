import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import Tile, { animals, default_pixels_per_cm } from './Tile'
import FiveFrame from './FiveFrame'
import Num from './Num'
import { global_constant } from '../App'
import { height2tower_name } from '../providers/query_tower';
import { query_prop } from '../providers/query_store';
//import { global_screen_width, global_screen_height} from './Workspace'

function init_page_dimensions(use11x17, landscape,
  scale_down_for_laptop, rotate_whole_page) {
  let width, height;
  if (use11x17) {
    if (landscape) {
      width = global_constant.print_size11x17.height
      height = global_constant.print_size11x17.width
    } else {
      width = global_constant.print_size11x17.width
      height = global_constant.print_size11x17.height
    }
  } else {  // use 8.5 x 11
    if (landscape) {
      width = global_constant.print_size8p5x11.height
      height = global_constant.print_size8p5x11.width
    } else {
      width = global_constant.print_size8p5x11.width
      height = global_constant.print_size8p5x11.height
    }
  }
  let transform = [];
  if (scale_down_for_laptop) {
    // temporary scale factor, so that I can see what the eventual result
    //   looks like:
    if (use11x17) transform.push({ 'scale': 0.28 })
    else {
      if (landscape) transform.push({ 'scale': 0.58 })
      //if (landscape) transform.push({ 'scale': 0.28 })
      else transform.push({ 'scale': 0.38 })
    }
  }
  if (rotate_whole_page) {
    transform.push({ 'rotate': '90deg' })
    transform.push({ 'translateY': -1 * height });
  }
  return [width, height, transform]
}

const PrintFigure = () => {
  const scale_down_for_laptop = true;
  const rotate_whole_page = false;
  let use11x17 = true;
  let landscape = false;
  let show_purple_border = true;

  if (!global_constant.print_size11x17) return null
  const extra_scale = global_constant.print_pixels_per_cm /
    global_constant.screen_pixels_per_cm

  let content = []
  if (0) {  // print all the animals, multiple per sheet
    let anim1 = {  // first animal figure positions
      "kitty": [1100, 1600],
      "puppy": [1100, 1950],
      "rhino": [5, 1300],
      "dragon": [5, 5],
      "giraffe": [795, 5],
    }
    let anim2 = {
      "crab": [1020, 5],
      "duck": [945, 1900],
      "pig": [5, 1850],
      "horse": [5, 930],
      "moose": [5, 5],
      "ladybug": [1100, 700],
      "mouse": [1100, 550],
      "fish": [1100, 300],
    }
    let anim3 = {
      "chimpanzee": [1130, 1600],
      "bear": [700, 1600],
      "chick": [5, 1600],
      "sloth": [750, 830],
      "deer": [5, 850],
      "bull": [720, 5],
      "unicorn": [5, 5],
    }
    const anim = anim3
    for (name in anim)
      content.push(<Tile name={name} position={anim[name]} extra_scale={extra_scale} key={name} />)
  } else if (0) {
    // print just one animal, large!
    if (0) {
      name = 'unicorn'
      const misc = { extra_scale: 2.9 * extra_scale }
      content.push(<Tile name={name} position={[-350, 5]} misc={misc} key={name} />)
    } else if (0) {  // two somewhat smaller unicorns
      name = 'unicorn'
      let misc = { extra_scale: 2 * extra_scale }
      content.push(<Tile name={name} position={[5, 5]} misc={misc} key={1} />)
      misc = { extra_scale: 1.5 * extra_scale }
      content.push(<Tile name={name} position={[300, 1500]}
        style={{ transform: [{ rotate: '90deg' }] }}
        misc={misc} key={2} />)
    } else if (1) {
      name = 'giraffe'
      const misc = { extra_scale: 1.94 * extra_scale }
      content.push(<Tile name={name} position={[5, 5]} misc={misc} key={name} />)
    } else if (0) {  // two somewhat smaller giraffes
      name = 'giraffe'
      let misc = { extra_scale: 1.4 * extra_scale }
      content.push(<Tile name={name} position={[5, 5]} misc={misc} key={1} />)
      misc = { extra_scale: 1.2 * extra_scale }
      content.push(<Tile name={name} position={[300, 1370]}
        style={{ transform: [{ rotate: '90deg' }] }}
        misc={misc} key={2} />)
    }
  } else if (0) {  // print 5-frames
    use11x17 = false
    landscape = true
    show_purple_border = false
    for (const i = 0; i < 6; ++i) {
      content.push(<FiveFrame name={5} position={[5 + i * 245, 5]} key={i} />)
    }
  } else if (0) {  // print worksheets for learning to draw tower diagrams
    use11x17 = false
    landscape = true
    show_purple_border = false
    const page1 = true
    if (page1) {
      content.push(
        <Text style={{
          position: 'absolute',
          left: 50,
          top: 50,
          fontSize: 30,
        }} key={'name'}>9/20/2018  Name: _________________</Text>
      )
    }
    const vals = page1 ? [.6, 1.1, .4] : [.8, 1.6, 1.9]
    const opacity = [1, .05, 0]
    const scale_factor = query_prop('scale_factor')
    for (const i = 0; i < 3; ++i) {
      for (const j = 0; j < 3; ++j) {
        content.push(
          <Num id={'tower_' + i}
            name={height2tower_name(vals[i % 3])}
            position={[150 * (3 * i + j) + 50 * i + 50, 0]}
            style={{ opacity: opacity[j] }}
            misc={{ as_diagram: true, hide_tower_name: true }}
            scale_factor={scale_factor}
            just_grey={true}
            key={3 * i + j} />
        )
      }
      content.push(
        <View style={{
          position: 'absolute',
          left: 500 * i,
          bottom: 0,
          width: 0,
          height: 1000,
          borderLeftWidth: 2,
          borderLeftColor: 'black',
        }} key={'sep' + i} />
      )
    }
  } else {  // print packets for teams building from diagrams
    use11x17 = false
    landscape = true
    //show_purple_border = false
    const page = 1
    const vals = [1.1, .3, .4, 1.2, .6, .8, 1.7, 1.8]
    const val = vals[page]
    if (0) {
      content.push(
        <Text style={{
          position: 'absolute',
          left: 50,
          top: 50,
          fontSize: 30,
        }} key={'name'}>9/20/2018  Name: _________________</Text>
      )
    }
    const scale_factor = query_prop('scale_factor')
    for (const i = 0; i < 4; ++i) {
      for (const j = 0; j < 2; ++j) {
        let val2 = ((page + j) % 2) ? 0 : val
        val2 = vals[2*i+j]  // temporary!
        content.push(
          <Num id={'tower_' + (2 * i + j)}
            name={height2tower_name(val2)}
            position={[150 * (2 * i + j) + 50 * i + 50, 0]}
            misc={{ as_diagram: true, hide_tower_name: true }}
            scale_factor={scale_factor}
            just_grey={true}
            key={2 * i + j} />
        )
        content.push(
          <View style={{
            position: 'absolute',
            left: 175 * (2* i + j),
            bottom: 0,
            width: 0,
            height: 1000,
            borderLeftWidth: 2,
            borderLeftColor: 'black',
          }} key={'sep' + i} />
        )
      }
    }
  }
  let [width, height, transform] = init_page_dimensions(use11x17,
    landscape, scale_down_for_laptop, rotate_whole_page)
  const borderWidth = show_purple_border ? 1 : 0

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