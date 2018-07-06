import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block';
import { query_tower_blocks } from '../providers/query_store'

const Tower = ({id, name, position, block_opacity = [], scale_factor}) => {
  // expand the name into individual blocks
  //console.log(name);
  const block_info = query_tower_blocks(id, {name, position, block_opacity});
  let blocks = [];
  for (const i = 0; i < block_info.length; ++i) {
    blocks.push(<Block size={block_info[i].size}
                       isFiver={block_info[i].isFiver}
                       height={block_info[i].height}
                       width={block_info[i].width}
                       opacity={block_info[i].block_opacity}
                       scale_factor={scale_factor}
                       bottom={block_info[i].bottom}
                       key={i}/>);
  }
  return (<View style={styles.tower}>
     {blocks}
    </View>
  )
}

const styles = StyleSheet.create({
  tower: {
    backgroundColor: 'orange',
    width: 200,
    height: 200,
    position: 'absolute',
    bottom: 0
  },
});

export default Tower