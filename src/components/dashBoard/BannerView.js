/**
 * @description Use to make Banner View
 */
import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Banner from 'app/src/screens/Dashboard/Banner';
import { socialShare } from 'app/src/utility/Utility';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { BANNER_PRESSED, VBD_BANNER_PRESSED } from 'app/src/utility/GAEventConstants';
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');

const { width, height } = Dimensions.get('window');

// test data
// const bannerData = [
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/844cc0b7-c92d-456b-b775-b8961ea5d57d/Joining-Scheme-App.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/844cc0b7-c92d-456b-b775-b8961ea5d57d/Joining-Scheme-App.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/844cc0b7-c92d-456b-b775-b8961ea5d57d/Joining-Scheme-App.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/844cc0b7-c92d-456b-b775-b8961ea5d57d/Joining-Scheme-App.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/844cc0b7-c92d-456b-b775-b8961ea5d57d/Joining-Scheme-App.jpg'},
//   {bannerUrl: 'https://s3.ap-south-1.amazonaws.com/vestige-qa/images/7d14628d-50f9-4d6c-aa79-7a5ec8a867a8/HomeEnervaEnergySnackBarAppBanner_1920X1080.jpg'},
// ];
export default class BannerView extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      activeIndex: 0,
    };
  }

  bannerPress(type, param, title) {
    const { navigation } = this.props;
    const params = `${param.key === 'brandId' ? 'brand.brandId' : param.key}=${param.keyId}`;
    navigation.navigate('productList', { type: type, param: params, title: title });
  }

  get pagination() {
    const { bannerData, countryId } = this.props;
    // let filteredBannerData = bannerData.filter((banner) => {
    //   return banner.countryId === countryId;
    // });
    return (
      <Pagination
        dotsLength={bannerData.length <= 8 ? bannerData.length : 8}
        activeDotIndex={this.state.activeIndex}
        containerStyle={{ paddingVertical: 5 }}
        dotStyle={{
          width: 12,
          height: 8,
          borderRadius: 5,
          marginHorizontal: 2,
          backgroundColor: 'rgba(52, 52, 52, 0.8)',
        }}
        inactiveDotStyle={{
          width: 8,
          height: 8,
          borderRadius: 5,
          marginHorizontal: 2,
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }

  renderItem = ({ item, index }) => {
    const image = item.bannerUrl
      ? { uri: item.bannerUrl }
      : PRODUCT_PLACEHOLDER;
    let bannerView;
    return (
      <TouchableOpacity
        key={index.toString()}
        activeOpacity={1.0}
        accessibilityLabel={item.landingScreen}
        testID={item.landingScreen}
        onPress={() => {
          if (item.bannerType.toUpperCase() === 'VBD') {
            // trackEvent(VBD_BANNER_PRESSED.eventCategory, VBD_BANNER_PRESSED.events.NAVIGATE);
            Linking.openURL(item.deepLinkUrl);
          } else if (item.bannerType.toUpperCase() === 'GOOGLE_FORM') {
            // trackEvent(VBD_BANNER_PRESSED.eventCategory, VBD_BANNER_PRESSED.events.NAVIGATE);
            this.props.navigation.navigate('youtubeListing', {
              uri: item.deepLinkUrl,
              screenTitle: 'Feedback Form',
            });
          } else {
            // trackEvent(BANNER_PRESSED.eventCategory, BANNER_PRESSED.events.NAVIGATE);
            this.bannerPress('banner', item.actionUrl, item.landingScreen);
          }
        }}>
        <Banner
          ref={screenShot => (bannerView = screenShot)}
          styles={styles.bannerView}
          resizeMode={item.bannerUrl ? 'cover' : 'contain'}
          source={image}
        />
        <TouchableOpacity
          style={{ position: 'absolute', right: 0, padding: 10 }}
          onPress={() => socialShare(bannerView)}>
          <Banner
            styles={styles.shareIcon}
            source={SHARE_IMAGE}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  render() {
    const { bannerData, countryId } = this.props;
    // let filteredBannerData = bannerData.filter((banner) => {
    //   return banner.countryId === countryId;
    // });
    
    return (
      <View style={styles.containerView}>
        <Carousel
          layout="default"
          loop
          autoplay
          autoplayInterval={2000}
          ref={ref => (this._carousel = ref)}
          data={bannerData}
          renderItem={this.renderItem}
          sliderWidth={width}
          itemWidth={width}
          onSnapToItem={index => this.setState({ activeIndex: index })}
        />
        {this.pagination}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerView: {
    marginTop: 10,
    height: 200,
    backgroundColor: '#fff',
  },
  bannerView: {
    width: Dimensions.get('window').width,
    height: 180,
  },
  shareIcon: {
    height: 20,
    width: 20,
    tintColor: '#ffffffd6',
  },
});
