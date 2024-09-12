import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import Banner from 'app/src/screens/Dashboard/Banner';
import { inject, observer } from 'mobx-react';

 
@inject('wishList','cart')
@observer
export default class TabIconUtil extends Component {
  
  static propTypes = {
    styles: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    resizeMode: PropTypes.string,
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]),
  }

  static defaultProps = {
    styles: { height: 50, width: 50 },
    resizeMode: null,
    source: null,
  };

  constructor(props) {
    super(props);
    this.props = props;
  }
 
  renderTabBadge = (count) => {
    return(
      count > 0 ? (
        <View style={{ position: 'absolute', left: 16, top: 6, backgroundColor: '#6797d4', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 11}}>{ count }</Text>
        </View>
      ) : null
    )
  }

  render() {
    const { resizeMode, source, routeName } = this.props;
    return(
      <View style={{ paddingVertical: 10 }}>
        <Banner styles={styles.tabIcon} resizeMode={resizeMode} source={source} />
        { routeName === 'Wishlist' && this.renderTabBadge(this.props.wishList.getwishlistCount) }
        { routeName === 'MyCart' && this.renderTabBadge(this.props.cart.totalProductsCount) }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});