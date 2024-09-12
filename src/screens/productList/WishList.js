
import React, { Component } from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ProductGrid from 'app/src/components/productComponent/ProductGrid';
import { observer, inject } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { WISHLIST_TAB_PRESS } from 'app/src/utility/GAEventConstants';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { Specs } from 'app/src/utility/Theme';
import Loader  from 'app/src/components/loader/Loader';
import autobind from 'autobind-decorator';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { connectedToInternet } from 'app/src/utility/Utility';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';





const ADD_ICON = require('app/src/assets/images/DashBoardHeader/add_Item.png');
const BUY_ICON = require('app/src/assets/images/DashBoardHeader/buy_Item.png');
const WISHLIST_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_icon.png');
const FAVOURITE_ICON = require('app/src/assets/images/productList/favourite_icon.png');
const RATING_ICON = require('app/src/assets/images/productList/rating_icon.png');

/**
 * @description It contains the complete Dashboard design
 */
@inject('wishList')
@observer
export default class WishList extends Component {
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    // trackEvent(WISHLIST_TAB_PRESS.eventCategory, WISHLIST_TAB_PRESS.events.NAVIGATE);
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      this.props.wishList.setWishLists([]);
      await this.props.wishList.fetchWishList('update');
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.props.wishList.fetchWishList('update');
    }
  }

  getComponentData = async () => {
    await this.props.wishList.fetchWishList('update');
  }

  render() {
    const { navigation, wishList } = this.props;
    const { isLoading, wishLists } = wishList;

    return (
      <View style={{ flex: 1 }}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Header
          navigation={this.props.navigation}
          screenTitle={'WishList'}
        />
        <FlatList
          key="h"
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={wishLists.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={isLoading ? <ActivityIndicator size="large" color="#5988e0" /> : <EmptyScreen products />}
          style={styles.flatList}
          data={(wishList.wishLists.length > 0) ? wishList.wishLists : []}
          renderItem={({ item }) => {
            return (
              <ProductGrid
                item={item}
                ratingIcon={RATING_ICON}
                addIcon={ADD_ICON}
                buyIcon={BUY_ICON}
                wishlistIcon={WISHLIST_ICON}
                favouriteIcon={FAVOURITE_ICON}
                mainView={styles.mainView}
                navigation={navigation}
                wishListDisplay="flex"
                navigationFromWishlist
                getComponentData={() => this.getComponentData()}
              />
            );
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flatList: {
    marginHorizontal: '4%',
    backgroundColor: '#f2f5f8',
  },
  mainView: {
    width: '48%',
    marginTop: 10,
    backgroundColor: '#ffffff',
    marginLeft: 0,
    padding: 0,
    borderRadius: 4,
  },
  pageHeading: {
    color: '#373e73',
    fontSize: 18,
    ...Specs.fontBold,
    marginLeft: 20,
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
