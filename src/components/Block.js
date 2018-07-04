import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import * as myglobal from '../myglobal';

const Block = ({size, bottom, scaleFactor}) => {
  const sz = size.toLowerCase();
  const isFiver = (sz !== size);
  const height = scaleFactor * myglobal.size2value[sz];
  const width = isFiver ? 1.1*height : height;
  //console.log('scaleFactor ' + scaleFactor + ' size ' + size + ' sz ' + sz);
  return (
  <View style={[styles.block, {bottom: bottom,
                               backgroundColor: myglobal.size2color[sz],
                               borderRadius: 0.1*height,
                               borderLeftWidth: (isFiver ? 0.1*height : 0),
                               borderLeftColor: (isFiver ? '#328' : 'transparent'),
                               width: (width-1), height: (height-1)}]}>
    <Text style={{color: '#eee',
                  marginBottom: .15*height,
                  fontSize: .75*height}} >
      {myglobal.size2symbol[sz]}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  block: {
    /*
    backgroundColor: 'blue',
    width: 100,
    height: 100,
    */
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});

export default Block
