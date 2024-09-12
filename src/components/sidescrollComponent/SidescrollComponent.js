import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react';
import ProductGrid from '../productComponent/ProductGrid';
import CartItems from '../productComponent/CartItemGrid';
import { strings } from '../../utility/localization/Localized';

const ADD_ICON = require('app/src/assets/images/DashBoardHeader/add_Item.png');
const BUY_ICON = require('app/src/assets/images/DashBoardHeader/buy_Item.png');
const WISHLIST_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_icon.png');
const WISHLIST_SELECTED_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_red.png');
const FAVOURITE_ICON = require('app/src/assets/images/productList/favourite_icon.png');
const RATING_ICON = require('app/src/assets/images/productList/rating_icon.png');

@inject('products', 'cart', 'auth', 'wishList', 'profile')
@observer
class SidescrollComponent extends Component {
  static propTypes = {
    title: PropTypes.string,
  };

  static defaultProps = {
    title: '',
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      type,
      title,
      navigation,
      products,
      item,
      productDetailView,
      update,
      updatedCountryId,
      reduceHeight,
    } = this.props;
    if ((this.props.profile.defaultAddressCountryId == 4 || this.props.profile.defaultAddressCountryId == 25) && title == strings.storeFront.title.mostlyViewed) {
      return null;
    }
    return (
      <View style={styles.mainView}>
        <View style={styles.headingView}>
          <Text style={styles.heading}>{title}</Text>
        </View>
        {type ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => item + index}
            style={styles.flatList}
            data={item.length > 0 ? item : []}
            extraData={update ? update : ''}
            renderItem={({ item }) => (
              <CartItems
                routeName={this.props.routeName}
                item={item}
                ratingIcon={RATING_ICON}
                addIcon={ADD_ICON}
                buyIcon={BUY_ICON}
                wishlistIcon={WISHLIST_ICON}
                wishlistSelectedIcon={WISHLIST_SELECTED_ICON}
                favouriteIcon={FAVOURITE_ICON}
                mainView={[
                  styles.datacontainer,
                  { width: 150, height: reduceHeight ? 250 : 320 },
                ]}
                navigation={navigation}
                countryId={updatedCountryId}
                productListDisplay="flex"
              />
            )}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => item + index}
            style={styles.flatList}
            data={
              item
                ? item
                : products.productList.length > 0
                ? products.productList
                : []
            }
            extraData={update ? update : ''}
            renderItem={({ item }) => (
              <ProductGrid
                routeName={this.props.routeName}
                item={item}
                ratingIcon={RATING_ICON}
                addIcon={ADD_ICON}
                buyIcon={BUY_ICON}
                wishlistIcon={WISHLIST_ICON}
                wishlistSelectedIcon={WISHLIST_SELECTED_ICON}
                favouriteIcon={FAVOURITE_ICON}
                mainView={[
                  styles.datacontainer,
                  { width: 150, minHeight: reduceHeight ? 250 : 320 },
                ]}
                navigation={navigation}
                productListDisplay="flex"
                updatedCountryId={updatedCountryId}
                productDetailView={
                  productDetailView ? productDetailView : false
                }
              />
            )}
          />
        )}
      </View>
    );
  }
}

export default SidescrollComponent;

const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  headingView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 17,
  },
  heading: {
    fontSize: 16,
    color: '#373e73',
    ...Specs.fontSemibold,
  },
  datacontainer: {
    marginTop: 18,
    marginHorizontal: 15,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    backgroundColor: '#ffffff',
    marginLeft: 0,
    padding: 0,
    borderRadius: 4,
    marginVertical: 3,
  },
  flatList: {
    paddingLeft: '4%',
    marginVertical: 19,
    paddingHorizontal: 4,
  },
});
