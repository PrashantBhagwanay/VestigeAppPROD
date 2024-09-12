import React, { Component } from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  TouchableNativeFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
import DeviceInfo from 'react-native-device-info';
import Draggable from './Draggable';

const { width, height } = Dimensions.get('window');
const floatAction = ['Shopping', 'Dashboard', 'scheme', 'Search', 'MyCart'];
@inject('auth')
@observer
export default class FloatingButton extends Component {
  constructor(props) {
    super(props);
    this.animation = new Animated.Value(0)
    this.state = {
      open: false
    }
  }

  onFloatPress = () => {
    const value = this.state.open ? 0 : 1
    Animated.spring(this.animation, {
      toValue: value,
      friction: 5
    }).start()
    this.setState((state) => ({
      open: !state.open
    }));
  }
  isIphoneXorAbove = () => {
    return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTVOS &&
      ((height === 812 || width === 812) || (height === 896 || width === 896))
    );
  }
  

  render() {
    const { auth, onActionPress } = this.props;
    const secondaryRotation = {
      transform: [
        { scale: this.animation },
        {
          translateY: this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -50],
            extrapolate: 'clamp'
          })
        }
      ]
    }

    if (floatAction.includes(auth.screenName)) {
      auth.setActionVisibilty(true)
    }
    else {
      auth.setActionVisibilty(false)
    }


    const secondaryOpacity = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })

    const rotate = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
      extrapolate: 'clamp'
    })

    if (auth.showFloat) {
      return (
        <Draggable
          backDrop={secondaryOpacity} 
          y={this.isIphoneXorAbove() ? height-150 : height-135} 
          x={width-60} 
          minX={5} 
          maxX={width-3}
          minY={this.isIphoneXorAbove() ? 30 : 10} 
          maxY={this.isIphoneXorAbove() ? height-30 : height-10} 
          open={this.state.open}
        >
          <View>   
            {/* <Animated.View style={{ flexDirection: 'row', opacity: secondaryOpacity }}>
              <TouchableOpacity onPress={()=>onActionPress()}>
                <Text style={styles.actionItems}>Support</Text>
                <View style={[styles.floatButton, styles.secondaryButton,{top:0}]}>
                  <Image source={require('../../assets/images/help.png')} style={{height:35,width:35}} />
                </View>
              </TouchableOpacity>
            </Animated.View> */}
         
            <TouchableWithoutFeedback onPress={()=>onActionPress()}>
              <View>
                <Image source={require('../../assets/images/help.png')} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Draggable>
      )
    }
    else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  floatButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 30,
    height: 30,
    left: 7,
    borderRadius: 15,
  },
  actionItems: {
    right: 60,
    top: 19,
    ...Specs.fontBold,
    fontSize: 14,
  }
})