import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { strings } from 'app/src/utility/localization/Localized';
import { inject, observer } from 'mobx-react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { capitalizeFirstCharacter } from 'app/src/utility/Utility';
import { Specs } from 'app/src/utility/Theme';

@inject('profile')
@observer
class LocationHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLocationHeaderClick = async (profile, navigation) => {
    if (profile.isMiUserShoppingForOthers) {
      navigation.navigate('selectMiUserAddress', { backScreenCount: 1 });
    } else {
      navigation.navigate('selectLocation');
    }
  };

  addressFormat = item => {
    const countryId = this.props.profile.defaultAddressCountryId;
    let pincode = countryId == 4 ? item?.state : item?.pincode;
    if (item.addressType === 'Shipping') {
      return `${capitalizeFirstCharacter(
        item.address,
      )}, ${capitalizeFirstCharacter(item.city)}, ${capitalizeFirstCharacter(
        item.state,
      )}, ${capitalizeFirstCharacter(item.country)}, ${pincode}`;
    }
    return `${item.address ? item.address.trim() + ', ' : ''}${
      item.locationName
    }`;
  };

  handleDeliveryPickupInfo = (addressType, activeAddress) => {
    const {
      fetchIsWarehouseShipping,
      fetchWarehouseDeliveryType,
      fetchRegularCatering,
    } = this.props.profile;

    if (
      addressType === 'Home-Delivery' &&
      fetchIsWarehouseShipping == '1' &&
      fetchWarehouseDeliveryType == '2'
    ) {
      return (
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
          <Text style={{ ...Specs.fontSemibold }}>
            {`${strings.selectShippingType.pickupStore} Address`}
          </Text>
          {`: ${fetchRegularCatering.locationName} - ${fetchRegularCatering.locationCode}`}
        </Text>
      );
    } else {
      return (
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
          <Text style={{ ...Specs.fontSemibold }}>{addressType}</Text>
          {`: ${this.addressFormat(activeAddress)} `}
        </Text>
      );
    }
  };

  render() {
    const { profile, navigation } = this.props;
    const { activeAddress, defaultCater } = profile;
    const addressType =
      activeAddress.addressType === 'Shipping'
        ? 'Home-Delivery'
        : 'Store Pick-up';
    if (activeAddress && activeAddress.pincode != 'Pincode not found') {
      return (
        <TouchableOpacity
          onPress={() => this.handleLocationHeaderClick(profile, navigation)}
          activeOpacity={0.9}
          style={{ width: '100%' }}>
          <LinearGradient
            style={{ paddingVertical: 8, paddingHorizontal: 10 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#6C94D5', '#668ECF', '#3054C4']}>
            <>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome
                  name="map-marker"
                  size={15}
                  color="#fff"
                  style={{ top: 3 }}
                />
                <View style={{ flex: 1 }}>
                  {this.handleDeliveryPickupInfo(addressType, activeAddress)}
                </View>
                <FontAwesome
                  name="chevron-down"
                  size={13}
                  color="#fff"
                  style={{ top: 2 }}
                />
              </View>
              <Text
                style={{
                  ...styles.addressText,
                  marginLeft: 17,
                  ...Specs.fontSemibold,
                }}>
                Catering Location:
                <Text style={{ ...Specs.fontRegular }}>{` ${
                  defaultCater?.locationName
                    ? defaultCater?.locationName + ' - '
                    : ''
                }${
                  defaultCater?.locationCode ? defaultCater?.locationCode : ''
                }`}</Text>
              </Text>
              {addressType === 'Home-Delivery' ? (
                <Text
                  style={{
                    ...styles.addressText,
                    marginLeft: 17,
                    ...Specs.fontSemibold,
                  }}>
                  Shipping Type:
                  <Text
                    style={{
                      ...Specs.fontRegular,
                    }}>{` ${profile.defaultShippingType}`}</Text>
                </Text>
              ) : null}
            </>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return null;
  }
}

export default LocationHeader;

const styles = StyleSheet.create({
  addressText: {
    ...Specs.fontRegular,
    fontSize: 13,
    color: '#fff',
    marginLeft: 8,
    marginTop: 1,
  },
});
