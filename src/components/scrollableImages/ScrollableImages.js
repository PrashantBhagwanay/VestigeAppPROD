import React, { Component } from 'react'
import { Animated, View, StyleSheet, Dimensions, ScrollView, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import Banner from 'app/src/screens/Dashboard/Banner';
import { strings } from 'app/src/utility/localization/Localized';

const deviceWidth = (Dimensions.get('window').width)*0.7
const BAR_SPACE = 10

const PRODUCTIMAGE = require('app/src/assets/images/productList/placeHolder.png');
const PRODUCT_PLACEHOLDER_NEPAL = require('app/src/assets/images/productList/placeHolder_nepal.png');

export default class ScrollableImages extends Component {

  static propTypes = {
    outOfStock: PropTypes.number,

  }
  static defaultProps = {
    outOfStock: 0,
  };

 
  animVal = new Animated.Value(0)

  render() {
    const {countryId, images, outOfStock , updateImageUrls, isMovableToWarehouse, isWarehouseShipping, isWarehouseAvailable} = this.props;
    let imageArray = []
    let barArray = []
    images.forEach((image, i, arr) => {
      if(image != ''){
        const thisImage = (
          <TouchableOpacity key={i.toString()} onPress={() => updateImageUrls(image.url)}>
            <Banner
              key={`image${i.toString()}`}
              styles={[styles.imageStyle,(image.url)?{height:'100%'}:{height:'40%'}]}
              resizeMode='contain'
              source={(image.url)?{uri:image.url}:(countryId != 2 ? PRODUCTIMAGE : PRODUCT_PLACEHOLDER_NEPAL)}
            />
          </TouchableOpacity>
        )
        imageArray.push(thisImage)
        const scrollBarVal = this.animVal.interpolate({
          inputRange: [deviceWidth * (i - 1), deviceWidth * (i + 1)],
          outputRange: [-20, 20],
          extrapolate: 'clamp',
        })

        const thisBar = (
          <View
            key={`bar${i.toString()}`}
            style={[
              styles.track,
              {
                width: 20,
                marginLeft: i === 0 ? 0 : BAR_SPACE,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.bar,
                {
                  width: 20,
                  transform: [
                    { translateX: scrollBarVal },
                  ],
                },
              ]}
            />
          </View>
        )
        if(arr.length > 1) {
          barArray.push(thisBar)
        }
      }
    })

    return (
      <View style={styles.container} flex={1}>
        <ScrollView
          horizontal
          keyboardShouldPersistTaps='always'
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={10}
          pagingEnabled
          // onScroll={Animated.event(
          //   [{ nativeEvent: { contentOffset: { x: this.animVal } } }],
          //   { useNativeDriver: true },
          // )}
        >
          {imageArray}
        </ScrollView>
        <View style={styles.barContainer}>{barArray}</View>
        {( outOfStock < 1) && (
          ((!isMovableToWarehouse) || (isWarehouseShipping === '1') || (!isWarehouseAvailable)) ?
            (
              <View style={styles.barContainer2}>
                <Text style={styles.textStyle}>
                  {strings.product.outOfStock}
                </Text>
              </View>
            )
            : null
        )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  textStyle:{
    color:'#d0021b',
    fontSize:18,
    textAlign:'center',
    marginTop:8,
    marginBottom:13,
    ...Specs.fontMedium,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    position: 'absolute',
    zIndex: 2,
    bottom: 10,
    flexDirection: 'row',
  },
  barContainer2: {
    width:'80%',
    zIndex: 2,
    alignItems:'center',
    backgroundColor:'#ffffffD9',
    flexDirection: 'row',
    position:'absolute',
    justifyContent:'center',
    shadowOffset:{  width: 2,  height: 2,  },
    shadowColor: '#cfcfcf',
    shadowOpacity: 0.8,
  },
  track: {
    backgroundColor: '#ccc',
    overflow: 'hidden',
    height: 2,
  },
  bar: {
    backgroundColor: '#5294d6',
    height: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  imageStyle:{ 
    width: deviceWidth,
    alignSelf:'center' 
  }
})