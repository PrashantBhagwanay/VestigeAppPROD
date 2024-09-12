// @flow

import React, { Component } from 'react';
import { Text, StyleSheet,View } from 'react-native';
import { Specs } from 'app/src/utility/Theme';

type Props = {
  children: any,
  style: any,
}

export default class Label extends Component {
  
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const {children, style} = this.props;
    return(
      <View>
        <Text style={[styles.text, style]}>{children}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    ...Specs.fontSemiBold,
    fontSize: 12,
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#14aa93',
    borderRadius: 10,
    overflow:'hidden',
    alignSelf:'flex-start'
  }
});