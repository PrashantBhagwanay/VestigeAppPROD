import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Dimensions, Image, LayoutAnimation, TouchableOpacity } from 'react-native';
import { Specs } from 'app/src/utility/Theme';

const { width, height } = Dimensions.get('window');

export default class TurtorialStep extends Component {
  static propTypes = {
    step: PropTypes.number,
    tooltip: PropTypes.string,
    visible: PropTypes.bool,
    style: PropTypes.object,
    position: PropTypes.object,
    tooltipPosition: PropTypes.object,
    onPress: PropTypes.func,
    okEnable: PropTypes.bool,
    onPressMark: PropTypes.func,
    endModal: PropTypes.bool,
    isCircleMask: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]),
  };

  static defaultProps = {
    okEnable: true,
    endModal: false,
    isCircleMask: true,
    icon: undefined
  };

  render() {
    const {
      tooltip, visible, position, tooltipPosition, okEnable, onPressMark, endModal, isCircleMask, description
    } = this.props;

    const firstOverlayWidth = position.left;
    const firstOverlayHeight = height;
    const firstOverlayX = 0;
    const firstOverlayY = 0;

    const secondOverlayWidth = this.props.style.width;
    const secondOverlayHeight = position.top;
    const secondOverlayX = position.left;
    const secondOverlayY = 0;

    const thirdOverlayWidth = width - position.left - this.props.style.width;
    const thirdOverlayHeight = height;
    const thirdOverlayX = position.left + this.props.style.width;
    const thirdOverlayY = 0;

    const fourthOverlayWidth = this.props.style.width;
    const fourthOverlayHeight = height - position.top - this.props.style.height;
    const fourthOverlayX = position.left;
    const fourthOverlayY = position.top + this.props.style.height;
    const lineLogoImg = require('app/src/assets/images/mask.png');

    return (
      visible && (
        <View style={styles.backArea}>
          <View style={[styles.overlay,
            {
              left: firstOverlayX,
              top: firstOverlayY,
              width: firstOverlayWidth,
              height: firstOverlayHeight,
            }]}
          />
          <View style={[styles.overlay,
            {
              left: secondOverlayX,
              top: secondOverlayY,
              width: secondOverlayWidth,
              height: secondOverlayHeight,
            }]}
          />
          <View style={[styles.overlay,
            {
              left: thirdOverlayX,
              top: thirdOverlayY,
              width: thirdOverlayWidth,
              height: thirdOverlayHeight,
            }]}
          />
          <View style={[styles.overlay,
            {
              left: fourthOverlayX,
              top: fourthOverlayY,
              width: fourthOverlayWidth,
              height: fourthOverlayHeight,
            }]}
          />
          {!endModal && (
            <View style={[styles.tooltip, tooltipPosition]}>
              {this.props.icon && (
                <View style={{width: 60, height: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderRadius: 30, marginVertical: 80}}>
                  <Image
                    resizeMode='contain'
                    style={{width: 25, height: 25}}
                    source={this.props.icon}
                  />
                </View>
              )}
              <Text style={styles.tooltipText}>{tooltip}</Text>
              <Text style={styles.descriptionText}>{description}</Text>
              {okEnable && (
                <TouchableOpacity 
                  accessibilityLabel={description}
                  testID={description}
                  onPress={() => this.OKButton()}>
                  <Text style={styles.buttonText}>Got it!</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {okEnable && (
            <View style={[{ width: this.props.style.width, height: this.props.style.height }, this.props.position]}>
              <View style={[this.props.style, styles.coachMarks]} />
              {isCircleMask && (
                <Image
                  source={lineLogoImg}
                  resizeMode="stretch"
                  style={{flex: 1, width: null, height: null}}
                />
              )}
            </View>
          )}
          {!okEnable && (
            <View style={[{ width: this.props.style.width, height: this.props.style.height }, this.props.position]}>
              {isCircleMask && (
                <Image
                  source={lineLogoImg}
                  resizeMode="stretch"
                  style={{flex: 1, width: null, height: null}}
                />
              )}
              <View style={[this.props.style, styles.coachMarks]}>
                <TouchableOpacity
                  onPress={() => {
                    this.OKButton();
                    onPressMark();
                  }}
                  style={{ width: this.props.style.width, height: this.props.style.height }}
                  activeOpacity={1.0}
                />
              </View>
            </View>
          )}
        </View>
      )
    );
  }

  OKButton() {
    LayoutAnimation.easeInEaseOut(); 
    requestAnimationFrame(async()=>{
    this.props.onPress(this.props.step);
    })
  }
}

const styles =  StyleSheet.create({
  coachMarks: {
    position: 'absolute',
  },
  tooltip: {
    overflow: 'hidden',
    position: 'absolute',
    alignSelf: 'center',
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tooltipText: {
    color: '#fff',
    textAlign: 'center',
    paddingBottom: 15,
    lineHeight: 24,
    fontSize:16,
    ...Specs.fontBold,
  },
  descriptionText: {
    color: '#fff',
    textAlign: 'left',
    paddingBottom: 20,
    lineHeight: 24,
    fontSize:14,
    ...Specs.fontReguler,
  },
  backArea: {
    width: width,
    height: height,
    top: 0,
    right: 0,
  },
  overlay: {
    backgroundColor: '#000000B3',
    position: 'absolute',
  },
  buttonText: {
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
    fontSize:16,
    ...Specs.fontMedium
  }
});
