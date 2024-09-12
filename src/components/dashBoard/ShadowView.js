/**
 * @description Component use to display shadow view with image
 */
import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';

export default class ShadowView extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const { topImage, title } = this.props;
    return (
      <TouchableOpacity style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}
        onPress={() => this.props.handleButtonClicked(title)}
      >
        <Image
          style={styles.image}
          source={topImage}
          resizeMode='contain'
        />
        <Text style={styles.containerText}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 10 },
    shadowColor: 'gray',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  containerInfo: {
    width: '25%',
    height: 80,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    marginLeft: '6.25%',
  },
  image: {
    marginTop: 15,
    height: 27,
    width: 29,
    marginBottom: 5,
    alignSelf: 'center',
  },
  containerText: {
    ...Specs.fontMedium,
    fontSize: 12,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
