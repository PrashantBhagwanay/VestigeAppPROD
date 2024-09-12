/**
 * @description Use to make My BrandStore screen
 */
import React, { Component } from 'react';
import {View, ScrollView, StyleSheet } from 'react-native';
import { inject, observer } from 'mobx-react';
import BrandComponent from 'app/src/components/dashBoard/BrandComponent';
import { Specs } from 'app/src/utility/Theme';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader';
import { strings } from 'app/src/utility/localization/Localized';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

@inject('dashboard', 'profile')
@observer
export default class BrandStore extends Component {

  constructor(props) {
    super(props);
  }

  brandStoreClickeHandle = (title, param) => {
    const data = {
      brandId: param,
      name: title
    }
    this.props.navigation.navigate('storeFront', {data: data});
    // this.props.navigation.navigate('productList',{type:'brandStore', param:param,title:type});
  }

  render() {
    const { brandList } = this.props.dashboard;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    return (
      <View style={styles.mainView}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.dashboard.brandsStore}
        />
        {(showlocationFlag == true) && <LocationHeader navigation={this.props.navigation} /> }
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={styles.rowView}>
            {
              brandList.map((item, index) => (
                <BrandComponent 
                  key={index.toString()}
                  imageContainer={styles.imageContainer} 
                  imageStyle={styles.imageStyle} 
                  image={item.image} 
                  brandStoreClickeHandle={this.brandStoreClickeHandle} 
                  title={item.name}
                  titleStyle={styles.titleStyle} 
                  brandId={item.id}
                />
              ))
            }
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
  },
  titleStyle: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#3f4967',
    alignSelf:'center'
  }
});