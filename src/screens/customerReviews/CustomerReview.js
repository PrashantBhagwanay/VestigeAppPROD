import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
// import { Picker } from 'native-base'
import { observer, inject } from 'mobx-react';
import { roundHalf } from 'app/src/utility/Utility';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import RatingDescription from 'app/src/screens/productList/component/RatingDescription'
import StarRating from '../../lib/starRating';
import ProgressBarAnimated from 'app/src/components/progressBar/ProgressBar';
import { Header } from '../../components';

const SCREEN_WIDTH = Dimensions.get('screen').width
const TEXT_WIDTH = SCREEN_WIDTH/5
const BAR_WIDTH = SCREEN_WIDTH/1.6

/**
 * Need to re-work before making it active on picker, as native base is having issue.
 * Use custom made bottomsheet picker on the place.
 */
@inject('products')
@observer
export default class CustomerReview extends Component {

  constructor(props) {
    super(props);
    this.props = props
    this.state = {
      filterPickerValue: 'topReviews',
      reviewListing: [],
      page: 0,
      progressBarFilterList: []      
    }
  }

  async componentDidMount() {
    const res = await this.props.products.getProductRatings(this.props.route.params.skuCode, 'getAllReviews',this.state.filterPickerValue,  this.state.page, 1000);
    if(res.success) {
      let ratingsPercentageArrayList = [
        {
          rating: '5 star',
          key: 'rating5',
          percentage: 0,
          value: 5
        },
        {
          rating: '4 star',
          key: 'rating4',
          percentage: 0,
          value: 4
        },
        {
          rating: '3 star',
          key: 'rating3',
          percentage: 0,
          value: 3
        },
        {
          rating: '2 star',
          key: 'rating2',
          percentage: 0,
          value: 2
        },
        {
          rating: '1 star',
          key: 'rating1',
          percentage: 0,
          value: 1
        }
      ]
      for(let property in this.props.products.productFeedbackResponse.overAllRating){
        ratingsPercentageArrayList.forEach( (obj) => {
          if(obj.key === property) {
            obj.percentage = this.props.products.productFeedbackResponse.overAllRating[property]
          }
        })
      }
      this.setState({
        progressBarFilterList: ratingsPercentageArrayList,
        reviewListing: res.data
      })
    }
  }

  async componentWillUnmount() {
    await this.props.products.getProductRatings(this.props.route.params.skuCode, 'getAllReviews');
  }

  progressBarItemPressed = async(item) => {
    const res =  await this.props.products.getProductRatings(this.props.route.params.skuCode, 'getAllReviews',this.state.filterPickerValue,  this.state.page, 1000, item.value);
    if(res.success) {
      this.setState({
        reviewListing: res.data
      })
    }
  }

  renderProgressBarItem = (item) => {
    return(
      <TouchableOpacity style={styles.progressBarContainer} onPress={()=> this.progressBarItemPressed(item) }>
        <Text style={styles.progressBarRatingText}>{item.rating}</Text>
        <ProgressBarAnimated
          width={BAR_WIDTH}
          value={item.percentage}
          height={40}
          borderColor='#979797'
          backgroundColor='#e5be22'
          underlyingColor='#e9e9e9'
          backgroundColorOnComplete="#6CC644"
          barAnimationDuration={1000}
          backgroundAnimationDuration={5000}
        />
        <Text style={styles.progressBarPercentage}>
          { item.percentage }
           % 
        </Text>
      </TouchableOpacity>
    )
  }

  setPickerValue = async(filterPickerValue) => {
    this.setState({ filterPickerValue }, async()=> {
      const res =  await this.props.products.getProductRatings(this.props.route.params.skuCode, 'getAllReviews', this.state.filterPickerValue, this.state.page, 1000)
      this.setState({
        reviewListing: res.data
      })
    })
  }

  // paginate = async() => {
  //   this.setState({
  //     page: this.state.page + 1
  //   })
  //   await this.props.products.getProductRatings(this.props.route.params.skuCode, 'getAllReviews', this.state.filterPickerValue, this.state.page, 5)
  // }  

  render() {
    const { overAllRating } = this.props.route.params
    return (
      <View style={{flex: 1}}>
        <Header
          navigation={this.props.navigation}
          screenTitle={'All Reviews'}
        />
        <ScrollView style={styles.container}>
          <View style={styles.ratingContainer}>
            <Text style={styles.totalCustomerReviews}>
              {this.state.reviewListing.count + ' '} 
            Customer Reviews
            </Text>
            <View style={styles.starRatingContainer}>
              <StarRating
                disabled
                starSize={16}
                maxStars={5}
                starStyle={{paddingHorizontal: 5}}
                rating={roundHalf(overAllRating)}
                fullStarColor='#f2b01e'
                halfStarColor='#f2b01e'
              />
              <Text style={styles.averageStarCount}> 
                { overAllRating+ ' ' } 
              out of 5 stars 
              </Text>
            </View>
            <FlatList
              data={this.state.progressBarFilterList}
              renderItem={({item}) => this.renderProgressBarItem(item)}
              keyExtractor={(item, index) => item + index}
            />
          </View> 
          {/* <View style={{ backgroundColor: '#e9e9e9', borderWidth: 1, borderColor: '#979797', width: 180, marginTop: 15, borderRadius: 5, marginBottom: 32, marginLeft: 17 }}>
            <Picker
              mode="dropdown"
              placeholder="Select your Type"
              style={{ width: '100%' }}
              selectedValue={this.state.filterPickerValue}
              onValueChange={(filterPickerValue) => this.setPickerValue(filterPickerValue)}
            >
              <Picker.Item label="Top Reviews" value="topReviews" />
              <Picker.Item label="Recent Reviews" value="recentReviews" />
            </Picker>
          </View> */}
          <View
            style={{
              borderBottomColor: '#c8c9d3',
              borderBottomWidth: 1,
              opacity: 0.34,
              marginBottom: 10
            }}
          />
          <FlatList
            style={{ paddingHorizontal: 17 }}
            data={this.state.reviewListing.ratings}
            renderItem={({item}) => <RatingDescription item={item} />}
            keyExtractor={(item, index) => item + index}
            // onEndReachedThreshold={0.5}
            // onEndReached={() => this.paginate()}
          />
        </ScrollView>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#ffffff',
    // paddingHorizontal: 17
  },
  progressBarContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 40, 
    width: SCREEN_WIDTH, 
    marginTop: 7
  },
  progressBarRatingText: {
    color: '#373e73', 
    ...Specs.fontMedium, 
    width: TEXT_WIDTH, 
    fontSize: 14 
  },
  progressBarPercentage: {
    color: '#373e73', 
    ...Specs.fontMedium, 
    fontSize: 12, 
    marginLeft: 10
  },
  ratingContainer: {
    flexDirection: 'column', 
    marginTop: 20, 
    marginBottom: 11,
    paddingHorizontal: 17
  },
  totalCustomerReviews: {
    ...Specs.fontSemibold, 
    fontSize: 16, 
    color: '#373e73'
  },
  starRatingContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 12
  },
  averageStarCount: {
    color: '#46586f', 
    fontSize: 14, 
    ...Specs.fontMedium, 
    marginLeft: 15
  }
})

