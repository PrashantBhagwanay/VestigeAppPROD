
import React, { Component } from 'react';
import {
  TouchableOpacity, StyleSheet,
} from 'react-native';

import Banner from '../../screens/Dashboard/Banner'

const styles = StyleSheet.create({
  containerView: {
    width: '30%',
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '2.25%',
  },
  winnerImage: {
    borderRadius: 5,
  },
});

export default class Winners extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const { winnerImg, winnerClickedHandler } = this.props;
    return (
      <TouchableOpacity 
        style={styles.containerView}
        onPress={() => winnerClickedHandler()}
      >
        <Banner
          styles={styles.winnerImage}
          source={winnerImg}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }
}
