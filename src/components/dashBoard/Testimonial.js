/**
 * @description Testimonial  view
 */
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
} from 'react-native';
import { strings } from 'app/src/utility/localization/Localized';
import LinearGradient from 'react-native-linear-gradient';

/**
 * @description: This is the custom stylesheet for Testimonial
 */
const styles = StyleSheet.create({
  containerView: {
    // backgroundColor: '#f7f7fa',
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 10,
  },
  whatSaidText: {
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    textAlign: 'left',
    color: '#385070',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundQuoteImageView: {
    height: 50,
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  quoteImage: {
    marginTop: 5,
    marginRight: 40,
    height: 50,
    width: 70,
  },
  textimonialTextBackgroundView: {
    marginTop: 5,
    // margin: 8,
    marginRight: 16,
    marginLeft: 16,
    flex: 1,
    // alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#d8d8e0',
    // flexDirection: 'row',
    backgroundColor: '#fff',
    // position: 'absolute',
    // alignItems: 'center',
  },
  testimonialText: {
    marginTop: 20,
    margin: 8,
    padding: 8,
    textAlign: 'center',
    color: '#385070',
    fontSize: 14,
    marginBottom: 20,
  },
  profileBackgroundView: {
    height: 30,
    width: 30,
    alignSelf: 'center',
  },
  profileImage: {
    marginTop: -15,
    height: 30,
    width: 30,
    marginRight: 10,
    position: 'absolute',
  },
  userNameText: {
    marginTop: -10,
    textAlign: 'center',
    color: '#2b3e57',
    fontSize: 16,
    alignSelf: 'center',
  },
  crownText: {
    marginBottom: 25,
    textAlign: 'center',
    color: '#7e92ab',
    fontSize: 14,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});

const QUOTE_IMAGE = require('../../assets/images/DashBoardHeader/quote_icon.png');
const PROFILEDEFAULT_IMAGE = require('../../assets/images/DashBoardHeader/profileImage.png');


/**
 * @description: This is use for Testimonial  view
 */
export default class Testimonial extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const { testimonial } = this.props;
    return (
      <LinearGradient 
        style={styles.containerView}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 1 }}
        colors={['#f7f7fa', '#fff']}
      >
        <View style={styles.textimonialTextBackgroundView}>
          {testimonial && testimonial.words && <Text style={styles.testimonialText}>{testimonial.words}</Text>}
        </View>
        <View style={styles.profileBackgroundView}>
          <Image
            style={styles.profileImage}
            source={PROFILEDEFAULT_IMAGE}
            resizeMode="center"
          />
        </View>
        {testimonial && testimonial.name && <Text style={styles.userNameText}>{testimonial.name}</Text>}
        { testimonial && testimonial.level && <Text style={styles.crownText}>{testimonial.level}</Text>}
      </LinearGradient>
    );
  }
}