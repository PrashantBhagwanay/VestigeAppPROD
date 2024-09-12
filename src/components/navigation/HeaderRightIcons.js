import React, {Component} from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { NOTIFICATION_BUTTON_PRESS } from 'app/src/utility/GAEventConstants';
import { Specs } from 'app/src/utility/Theme';
import { CommonActions } from '@react-navigation/native';
import { UserRole, LOCATION_ROUTE_PATH } from 'app/src/utility/constant/Constants';

const CREATETRAINING = require('app/src/assets/images/myTraining/createTraining.png');
const NOTIFICATION_BELL_IMAGE = require('../../assets/images/DashBoardHeader/notification.png');
const CART_IMAGE = require('../../assets/images/DashBoardHeader/cart.png');
const SEARCH_IMAGE = require('../../assets/images/DashBoardHeader/search.png');
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');

@inject('profile', 'auth', 'location')
@observer
export default class HeaderRightIcons extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  async showSkipCancel(locationNavigation){
    !this.props.auth.showSkip ? 
      locationNavigation.goBack() : 
      this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.next)
    locationNavigation.navigate('dashboard')
  }
  
  skipToShopping = (defaultShoppingMode) => {
    // if(this.props.route.params) {
    //   var {defaultShoppingMode} = this.props.route.params
    // }
    if(defaultShoppingMode) {
      this.props.navigation.dispatch(CommonActions.reset({
        index: 0,
        actions: [
          CommonActions.navigate({ name: 'Shopping'})
        ]
      }))
    }
    else {
      this.props.navigation.pop(3)
    }
  }

  render() {
    const { search, share, notification, cart, navigation, doneSkip, locationNavigation, kycSkip, kycNavigation, trainingNavigation, onPressShare, skipToShopping, defaultShoppingMode, handleKycSkip } = this.props;
    return (
      <View style={styles.container}>
        {
          skipToShopping && (
            <TouchableOpacity
              // style={[styles.buttonView, { backgroundColor: '#58cdb4' }]}
              onPress={() =>  this.skipToShopping(defaultShoppingMode)}
            >
              <Text style={styles.skipToShopping}>Skip</Text>
            </TouchableOpacity>
          )
        }
        { search && (
          <TouchableOpacity
            style={styles.tapableArea}
            onPress={() => console.log('search')}
          >
            <Image
              source={SEARCH_IMAGE}
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
        {share && (
          <TouchableOpacity
            style={styles.tapableArea}
            onPress={() => onPressShare()}
          >
            <Image
              source={SHARE_IMAGE}
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
        { notification &&  this.props.auth.userRole !== UserRole.GuestUser && (
          <TouchableOpacity
            style={[styles.tapableArea, {paddingHorizontal: 5}]}
            onPress={() => {
              // trackEvent(NOTIFICATION_BUTTON_PRESS.eventCategory, NOTIFICATION_BUTTON_PRESS.events.NAVIGATE);
              navigation.navigate('notificationScreen')
            }}
            accessibilityLabel="Header_Notification"
            testID="Header_Notification"
          >
            <Image
              source={NOTIFICATION_BELL_IMAGE}
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
        {/* This is last element don't move any where */}
        { cart && (
          <TouchableOpacity 
            style={styles.tapableArea} 
            onPress={() => {
              if(this.props.auth.userRole === UserRole.Trainer){
                alert( strings.cartListProduct.cartDistributorLimit)
                return
              }
              navigation.navigate('viewCart')
            }}
          >
            <Image
              style={{ marginRight: 9 }}
              source={CART_IMAGE}
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
        { doneSkip && (
          <TouchableOpacity
            onPress={()=> {
              // this.showSkipCancel(locationNavigation);
              locationNavigation.goBack()
            }}
          >
            {(this.props.profile.isMiUserShoppingForOthers || this.props.profile.activeAddress.addressType) && (
              <Text style={[styles.headerRightTextStyle, { marginRight: 10 }]}>{strings.headerComponent.cancel}</Text>
            )}
            {/* {this.props.profile.activeAddress.addressType && !this.props.auth.showSkip && (
              <Text style={styles.headerRightTextStyle}>{strings.headerComponent.cancel}</Text>
            )} */}
            {/* {!this.props.profile.activeAddress.addressType && this.props.auth.showSkip && (
              <Text style={styles.headerRightTextStyle}>{strings.commonMessages.skip}</Text>
            )} */}
          </TouchableOpacity>
        )}
        {/* {(kycSkip && !this.props.profile.activeAddress.addressType) && (
          <TouchableOpacity
            onPress={()=> {
              this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.next)
              kycNavigation.navigate('location')
            }}
          >
            <Text style={styles.headerRightTextStyle}>{strings.headerComponent.skip}</Text>
          </TouchableOpacity>
        )} */}
        {(kycSkip) && (
          <TouchableOpacity
            onPress={()=> handleKycSkip()}
          >
            <Text style={styles.headerRightTextStyle}>Skip</Text>
          </TouchableOpacity>
        )}

        {trainingNavigation && this.props.auth.userRole !== UserRole.Distributor  && (
          <TouchableOpacity
            onPress={()=> navigation.navigate('training')}
          >
            <Image style={styles.rightButtonIconImageStyle} source={CREATETRAINING} />
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tapableArea: {
    justifyContent: 'center', 
    height: 44, 
    paddingHorizontal: 15,
  },
  headerRightTextStyle: {
    fontSize: 14,
    color: '#515867',
    marginRight: 20,
  },
  rightButtonIconImageStyle: {
    height: 30,
    width: 30,
    margin: 10,
  },
  skipToShopping: {
    textDecorationLine: 'underline',
    ...Specs.fontMedium,
    color: '#5b8fcf',
    fontSize: 16,
    marginRight: 8
  }
});
