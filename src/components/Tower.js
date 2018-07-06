import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block';
import { query_tower_blocks } from '../providers/query_store'

export const global_size2color = {'-3': 'limegreen', '-2': 'purple', '-1': 'darkred',
          '0': 'blue', '1': 'green', '2': 'orange', '3': 'cyan'};
export const global_size2symbol = {'-3': '-', '-2': '^', '-1': 'o', '0': '|',
               '1': '\u25A1', '2': '\u25EB', '3': '\u25E7'};
export const global_size2fontsize = {'-3': 25, '-2': 30, '-1': 35, '0': 40,
               '1': 45, '2': 50, '3': 55};
export const global_size2padding = {'-3': 60, '-2': 50, '-1': 40, '0': 30,
               '1': 20, '2': 10, '3': 0};

export const global_fiver_shadow = {
                textShadowColor: 'orange',
                textShadowOffset: {width: -3, height: 0},
                textShadowRadius: 0
              };

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
    position: 'absolute',
    bottom: 0
  },
});

export default Tower