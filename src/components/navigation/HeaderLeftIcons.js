import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Image, Text, Platform } from 'react-native';
import { inject, observer } from 'mobx-react';
import { VESTIGE_IMAGE, LOCATION_ROUTE_PATH, UserRole, DISTRIBUTOR_TYPE_ENUM } from 'app/src/utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { get } from 'lodash';
import { strings } from 'app/src/utility/localization/Localized';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as AsyncStore from "app/src/utility/AsyncStoragesUtils";

const CHECKOUTADDRESS = AsyncStore.addPrefix("checkout-address");
const COUNTRY_ID = AsyncStore.addPrefix("country-id");

const HAMBURGER_IMAGE = require('app/src/assets/images/DashBoardHeader/hamburger_menu_icon.png');
const LOGO = require('app/src/assets/images/logo/nav-logo.png');
const NavLogoNepal = require('app/src/assets/images/logo/nav-logo-nepal.png');

@inject('profile', 'location', 'auth', 'cart')
@observer
export default class HeaderLeftIcons extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.downlineOrOthersText = this.props.auth.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP ? 'Others' : 'Downline';
    this.state = {
      storeAddress: 'Please select location first',
      editShopForColor: '#26429b'  // Blue
    }
    this.interval = setInterval(() => {
      this.setState(previousState => {
        return { editShopForColor: previousState.editShopForColor == '#26429b' ? '#2c937d' : '#26429b' };
      });
    },
    // Define blinking time in milliseconds
    1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  onBackPress = () => {
    const { navigation, isLoginRoute } = this.props;
    if (get(navigation, 'state.params.navigateTo', '') === 'Dashboard') {
      const resetAction = CommonActions.reset({
        index: 0,
        actions: [
          CommonActions.navigate({ name: 'MyCart' })
        ]
      });
      this.props.navigation.dispatch(resetAction);
      this.props.navigation.navigate('Dashboard')
    }
    else if (isLoginRoute) {
      const resetAction = CommonActions.reset({
        index: 0,
        actions: [
          CommonActions.navigate({ name: 'Dashboard' })
        ]
      });
      this.props.navigation.dispatch(resetAction);
      this.props.navigation.navigate('Dashboard')
    }
    else {
      navigation.goBack()
    }
  }

  updateWishListIcon = () => {
    const { navigation, route } = this.props;
    navigation.goBack();
    route.params.onWishlistUpdate && route.params.onWishlistUpdate()
  }

  handleDrawer = async () => {
    try {
      // let checkStore = JSON.parse(this.props.profile.checkoutAddress);
      let country_Id = await AsyncStore.get(COUNTRY_ID);
      this.props.profile.getUserMenuConfig(country_Id)
    } catch {

    }
    this.props.navigation.navigate('DrawerOpen');
  }

  handleBackBtn = () => {
    if (this.props.productDetails) {
      this.updateWishListIcon()
    }
    else {
      this.onBackPress()
    }
  }

  render() {
    const { back, drawer, logo, updateLocation, productDetails } = this.props;
    const selfOrDownline = this.props.cart.shopForObjectInfo.cartTitle == 'Your Cart' ? 'Self' : this.downlineOrOthersText;
    const distibutorIdValue = this.props.cart.shopForObjectInfo.distributorID ? '(' + this.props.cart.shopForObjectInfo.distributorID + ')' : ''
    return (
      <View style={styles.container}>
        {back &&
          (
            <TouchableOpacity
              style={styles.tapableArea}
              // accessibilityLabel='Back_Button'
              // testID='Back_Button'
              onPress={this.handleBackBtn}
            >
              <Icon name='ios-arrow-back' size={30} color='#3f4967' style={styles.drawerIcon} />
            </TouchableOpacity>
          )
        }

        {drawer &&
          (
            <TouchableOpacity style={styles.tapableArea} onPress={this.handleDrawer}>
              <Image
                style={styles.drawerIcon}
                resizeMode='contain'
                source={HAMBURGER_IMAGE}
              />
            </TouchableOpacity>
          )
        }
        {logo &&
          (
            <TouchableWithoutFeedback onPress={() => { }}>
              <Image
                style={[styles.logo, { marginLeft: drawer ? 0 : 15, width: this.props.profile.countryId != 2 ? 50 : 80 }]}
                resizeMode='cover'
                source={this.props.profile.countryId != 2 ? LOGO : NavLogoNepal}
              />
            </TouchableWithoutFeedback>
          )
        }
        {/* { updateLocation && this.props.auth.userRole!== UserRole.GuestUser &&
          (
            <TouchableWithoutFeedback onPress={() => {
              this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.back)
              this.props.navigation.navigate('selectLocation')
            }}
            >
              <View style={styles.locationContainer}>
                <View style={styles.locationImageContainer}>
                  {
                    <Text style={styles.locationTitleStyle}>{(this.props.profile.activeAddress.addressType === 'StorePickup')? strings.headerComponent.storePic : strings.headerComponent.homeDelivery }</Text>
                  }
                  <Image source={VESTIGE_IMAGE.OPEN_PICKER_BUTTON} style={styles.imageStyle} />
                </View>
                <View style={{ width: '100%' }}>
                  <Text 
                    numberOfLines={1}
                    style={styles.selectedLocationStyle}
                  >
                    {this.props.profile.activeAddress && (this.props.profile.activeAddress.locationName || this.props.profile.activeAddress.address)}
                  </Text>
                </View>
                <View style={styles.horizontalLineStyle} />
              </View>
            </TouchableWithoutFeedback>
          )
        } */}
        {updateLocation && (this.props.profile.countryId != 2 && this.props.profile.countryId != -1) && this.props.auth.userRole !== UserRole.GuestUser &&
          (
            <TouchableWithoutFeedback onPress={() => {
              this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.back)
              this.props.navigation.navigate('shoppingOption')
            }}
            >
              <View style={styles.locationContainer}>
                <View style={styles.locationImageContainer}>
                  {/* {
                    <Text style={styles.locationTitleStyle}>{(this.props.profile.activeAddress.addressType === 'StorePickup')? strings.headerComponent.storePic : strings.headerComponent.homeDelivery }</Text>
                  } */}
                  <Text style={styles.locationTitleStyle}>Shop For</Text>
                  <FontAwesome iconStyle={{ marginLeft: 5 }} name='pencil' size={12} color={this.state.editShopForColor} />
                  {/* <Image source={VESTIGE_IMAGE.OPEN_PICKER_BUTTON} style={styles.imageStyle} /> */}
                </View>
                <View style={{ width: '100%' }}>
                  <Text
                    numberOfLines={1}
                    style={{ ...styles.selectedLocationStyle }}
                  >
                    {`${selfOrDownline} ${distibutorIdValue}`}
                    {/* {this.props.profile.activeAddress && (this.props.profile.activeAddress.locationName || this.props.profile.activeAddress.address)} */}
                  </Text>
                </View>
                <View style={styles.horizontalLineStyle} />
              </View>
            </TouchableWithoutFeedback>
          )
        }
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
    paddingRight: 10,
  },
  drawerIcon: {
    marginLeft: 16
  },
  logo: {
    alignSelf: 'center',
    width: 50,
    height: 17
  },
  locationImageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationTitleStyle: {
    color: '#878993',
    fontSize: 10,
    marginRight: 4,
    ...Specs.fontBold,
  },
  imageStyle: {
    height: 5,
    width: 9
  },
  locationContainer: {
    marginLeft: Platform.OS === 'android' ? 24 : 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flex: 1
  },
  selectedLocationStyle: {
    color: '#22242e',
    maxWidth: '80%',
    fontSize: 12,
    ...Specs.fontRegular,
    marginBottom: 3,
  },
  horizontalLineStyle: {
    borderBottomWidth: 1,
    borderColor: '#979797',
    opacity: 0.4,
    maxWidth: '80%',
  }
});
