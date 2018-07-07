import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block';
import { query_tower_blocks } from '../providers/query_store'
import { global_workspace_height } from './Workspace'
import { global_size2color, global_size2symbol, global_fiver_shadow } from './Num';

const Tower = ({id, name, position, style = {}, block_opacity = [], scale_factor}) => {
  const block_info = query_tower_blocks(id, {name, position, block_opacity});

  let blocks = [], small_in_a_row = 0, fiver_in_a_row = 0, prev_size = null;
  for (const i = 0; i < block_info.length; ++i) {
    // compute all the style info for the blocks here, where we have context
    const b = block_info[i];
    const is_small = b.height < 10;
    const is_tiny = b.height < 4;
    const is_fiver = b.is_fiver;
    const size = b.size;
    if (is_small && !is_fiver) ++small_in_a_row;
    else small_in_a_row = 0;
    if (is_fiver) {
      if (size !== prev_size || 5 === fiver_in_a_row) fiver_in_a_row = 0;
      ++fiver_in_a_row;
    } else fiver_in_a_row = 0;
    prev_size = size;

    const width = b.width;
    //console.log('width', width)
    let height = b.height;
    const bottom = b.bottom;
    let marginBottom = (is_tiny || is_fiver) ? 0 : 1;
    let radius_style = {};
    const radius = 0.1 * (.5 * (height + width));
    if (is_fiver) {
      if (1 == fiver_in_a_row || 5 == fiver_in_a_row)
        height -= 1;
      if (1 == fiver_in_a_row) {
        marginBottom = 1;
        radius_style = { borderBottomLeftRadius: radius,
                         borderBottomRightRadius: radius };
      }
      if (5 == fiver_in_a_row) {
        radius_style = { borderTopLeftRadius: radius,
                         borderTopRightRadius: radius };
      }
    } else {
      if (is_tiny) height -= 0;
      else if (is_small) height -= 1;
      else height -= 2;
      if( !is_small ) radius_style = { borderRadius: radius };
    }
    //console.log(fiver_in_a_row, marginBottom)
    var marginLeft = 0;
    if (is_small) {
      if (is_fiver || !(small_in_a_row%2)) marginLeft = 1;
    }
    let width_factor = is_tiny ? .5 : is_small ? .4 : .1;
    const fiver_style = [{}, {
      borderLeftWidth: width_factor * height,
      borderLeftColor: is_tiny ? 'orange' : '#633',
    }, {
      borderRightWidth: width_factor * height,
      borderRightColor: is_tiny ? 'orange' : '#633',
    }][is_fiver];
    //console.log('radius_style', radius_style)
    let view_style = { position: 'absolute',
                       backgroundColor: (width < 10) ? 'black' : '#dbb',
                       bottom,
                       width,
                       height,
                       marginBottom,
                       marginLeft,
                       ...radius_style,
                       ...fiver_style
                     };

    const text_content = global_size2symbol[size];
    const color = global_size2color[size];
    const left = 5 + ((size >= 0) ? -.19 * height : 0);
    const textBottom = ((0 === size) ? .25 : (-2 === size) ? -1 : .10) * height;
    const fontSize = (is_tiny ? 0 : is_small ? 2 : .75) * height;
    let text_style = { position: 'absolute',
                       fontSize,
                       color,
                       left,
                       bottom : textBottom,
                       ...global_fiver_shadow[is_fiver]
                     };
    /*
    const misc = {small_in_a_row, fiver_in_a_row};
    blocks.push(<Block size={b.size}
                       is_fiver={b.is_fiver}
                       height={b.height}
                       width={b.width}
                       opacity={b.block_opacity}
                       scale_factor={scale_factor}
                       bottom={b.bottom}
                       misc={misc}
                       key={i}/>);
    */
    blocks.push(<Block view_style={view_style}
                       text_style={text_style}
                       text_content={text_content}
                       key={i}/>);
  }
  return (<View style={[styles.tower,
                        {'height': global_workspace_height},
                        style]}>
     {blocks}
    </View>
  )
}

const styles = StyleSheet.create({
  tower: {
    position: 'absolute',
    bottom: 0,
  },
});

export default Tower