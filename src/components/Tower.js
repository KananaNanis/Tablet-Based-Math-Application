import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block';
import { query_tower_blocks } from '../providers/query_store'
import { global_workspace_height } from './Workspace'

const Tower = ({id, name, position, style = {}, block_opacity = [], scale_factor}) => {
  // expand the name into individual blocks
  //console.log(name);
  //console.log(style);
  //style = {'width': 250, 'overflow': 'hidden'}
  const block_info = query_tower_blocks(id, {name, position, block_opacity});
  let blocks = [];
  for (const i = 0; i < block_info.length; ++i) {
    blocks.push(<Block size={block_info[i].size}
                       is_fiver={block_info[i].is_fiver}
                       height={block_info[i].height}
                       width={block_info[i].width}
                       opacity={block_info[i].block_opacity}
                       scale_factor={scale_factor}
                       bottom={block_info[i].bottom}
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