import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { roundHalf } from 'app/src/utility/Utility';
import { Icon } from 'react-native-elements';
import StarRating from '../../../lib/starRating';
import { observer, inject } from 'mobx-react';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import Banner from 'app/src/screens/Dashboard/Banner';
import RatingDescription from 'app/src/screens/productList/component/RatingDescription'

const UP_ARROW = require('app/src/assets/images/productList/arrow_up.png');
const DOWN_ARROW = require('app/src/assets/images/productList/arrow_down.png');

@inject('products')
@observer

export default class ProductFeedback extends Component {


  constructor(props) {
    super(props);
    this.props = props
    this.state = {
      showIcon: false,
      hideRatingContainer: false,
      productFeedback: false,
      productFeedbackResponseObject: null,
    }
  }

  async componentDidMount() {
    const res  = await this.props.products.getProductRatings(this.props.skuCode, 'getAllReviews');
    if(res.success) {
      this.setState({
        productFeedbackResponseObject: res.data,
        productFeedback: true
      })
    }
  }

  setText = () => {
    const { showIcon } = this.state;
    this.setState({
      showIcon: !showIcon
    })
  }

  setIcon(icon) {
    this.setState({
      showIcon: icon
    })
  }

  render() {
    const { hideRatingContainer, productFeedback, productFeedbackResponseObject } = this.state;
    const {  productFeedbackResponse } = this.props.products
    const overAllRating = this.props.overAllRating ? this.props.overAllRating : 0
    if(productFeedback) {
      return (
        <View style={styles.container}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 21, paddingHorizontal: 15 }}>
            <Text style={{ color: '#373e73', fontSize: 14, ...Specs.fontSemibold }}>Ratings & Reviews</Text>
            <TouchableOpacity style={{ paddingHorizontal: 5, paddingVertical: 4 }} onPress={()=> {this.setState({ hideRatingContainer: !hideRatingContainer }) }}>
              <Banner
                styles={styles.upIconStyle}
                source={hideRatingContainer ? DOWN_ARROW : UP_ARROW}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
          { 
            !hideRatingContainer && (
              <View>
                <Text style={{ fontSize: 16, paddingLeft: 15, ...Specs.fontSemibold, color: '#373e73', marginBottom: 10 }} >
                  { productFeedbackResponseObject.count+ ' ' } 
            Customer Reviews
                </Text>
                <View style={styles.starRatingContainer}>
                  <StarRating
                    disabled
                    starSize={16}
                    maxStars={5}
                    starStyle={{paddingHorizontal: 5 }}
                    rating={roundHalf(overAllRating)}
                    fullStarColor='#f2b01e'
                    halfStarColor='#f2b01e'
                  />
                  <Text style={styles.averageStarCount}> 
                    { overAllRating+ ' ' } 
                  out of 5 stars 
                  </Text>
                </View>
              </View>
            )
          }
          { !hideRatingContainer && (
            <View style={{paddingTop: 5, paddingHorizontal: 17, marginBottom: 10 }}>
              {
                productFeedbackResponseObject && productFeedbackResponseObject.ratings && productFeedbackResponseObject.ratings.map((feedback, index) => {
                  return index <= 4 && (
                    <View key={index.toString()} style={styles.cellView}>
                      <RatingDescription item={feedback} />
                    </View>
                  )
                })
              }
              {
                productFeedbackResponseObject && productFeedbackResponseObject.ratings && productFeedbackResponseObject.ratings.length > 4 && (
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 22, paddingVertical: 9, backgroundColor: '#cacaca', borderRadius: 20 }} 
                      onPress={()=>this.props.navigation.navigate('customerReviewListing', { overAllRating: overAllRating, skuCode: this.props.skuCode })}>
                      <Text style={{ color: '#000', fontSize: 12, ...Specs.fontMedium }}>View More</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
          )}
        </View>
      )
    }
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#ffffff',
  },
  cellView: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingTop: 15,
    // paddingLeft: 10,
  },
  writeAReviewText: {
    // color: '#9aadb8',
    color: '#000',
    fontSize: 12,
    ...Specs.fontMedium,
    textAlign: 'center',
    // textDecorationLine: 'underline'
  },
  upIconStyle: { 
    width: 15,
    height: 10 
  },
  starRatingContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    paddingBottom: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d3',
    paddingHorizontal: 15
  },
  averageStarCount: {
    color: '#46586f', 
    fontSize: 14, 
    ...Specs.fontMedium, 
    marginLeft: 13
  }
})

