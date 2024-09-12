/**
 * @description Use to make My BrandStore screen
 */
import React, { Component } from 'react';
import {View, ScrollView, StyleSheet,TouchableOpacity,Image,Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from 'app/src/utility/Theme';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader'

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const PRODUCT_PLACEHOLDER_NEPAL = require('app/src/assets/images/productList/placeHolder_nepal.png');

@inject('dashboard', 'profile')
@observer
export default class CategoryList extends Component {

  constructor(props) {
    super(props);
  }


  renderItem = (item, index) => {
    const {navigation} = this.props;
    const image = item.imageUrl ? {uri:item.imageUrl} : item.avatar
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('storeFront', {data: item})}
        style={[styles.imageContainer]} 
        key={index}
      >
        <Image 
          style={styles.imageStyle}
          resizeMode='contain'
          source={(image) ? image : (this.props.profile.countryId != 2 ? PRODUCT_PLACEHOLDER : PRODUCT_PLACEHOLDER_NEPAL)}
        />
        <Text style={styles.containerText}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const {navigation} = this.props;
    const { categoryList } = this.props.dashboard;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    return (
      <View style={styles.mainView}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.dashboard.categoriesTitle}
        />
        {(showlocationFlag == true) && <LocationHeader navigation={this.props.navigation} /> }
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={styles.rowView}>
            {
              categoryList.map(this.renderItem)}
          </View>
        </ScrollView>
      </View>
    );
  }
}

/**
 * @description: This is the custom stylesheet for Brand Store
 */
const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#eef1f6',
    width: '100%',
    flex: 1,
  },
  imageContainer: {
    width: '46%',
    height: 100,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginLeft: '2.66%',
  },
  imageStyle: {
    marginTop: 25,
    height: 50,
    width: '80%',
  },
  rowView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 20,
  }
});