import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, Image } from 'react-native';
import Testimonial from 'app/src/components/dashBoard/Testimonial';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';

const deviceWidth = Dimensions.get('window').width
const QUOTE_IMAGE = require('../../assets/images/DashBoardHeader/quote_icon.png');

export default class SuccessStories extends Component {
  
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const { successStoriesList } = this.props;
    return (
      <View style={styles.containerView}>
        <Text style={styles.whatSaidText}>{strings.successStories.title}</Text>
        <View style={styles.backgroundQuoteImageView}>
          <Image
            style={styles.quoteImage}
            source={QUOTE_IMAGE}
            resizeMode="center"
          />
        </View>
        <FlatList
          horizontal
          data={successStoriesList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              <View style={{ width: successStoriesList.length === 1 ? deviceWidth : deviceWidth * 0.80 , marginTop: 10 }}>
                <Testimonial testimonial={item} />
              </View> 
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={successStoriesList.length == 1 ? false : true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerView: {
    marginTop: 10,
    // height: 500,
    backgroundColor: '#fff'
  },
  whatSaidText: {
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    textAlign: 'left',
    color: '#385070',
    fontSize: 18,
    ...Specs.fontBold
    // fontWeight: 'bold',
  },
  backgroundQuoteImageView: {
    height: 50,
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  quoteImage: {
    marginTop: 5,
    marginRight: 40,
    height: 50,
    width: 70,
  },
});