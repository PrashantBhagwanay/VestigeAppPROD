import React, { Component } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  Keyboard,
  FlatList,
  StyleSheet,
} from 'react-native';
import Banner from 'app/src/screens/Dashboard/Banner';
import { observer, inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { Toast } from 'app/src/components/toast/Toast';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import Loader from 'app/src/components/loader/Loader';
import FaqHeaderView from 'app/src/screens/faq/FaqHeader';
import { Header } from '../../components';

const FORWARD_IC0N = require('app/src/assets/images/productDetails/forward_icon.png');

@inject('faq')
@observer
class Faq extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localFaqResultList: [],
    };
  }

  async componentDidMount() {
    const res = await this.props.faq.fetchFaqSearchResults();
    if (res.success) {
      this.setState({
        localFaqResultList: this.props.faq.faqSearchedResultList,
      });
    } else {
      showToast(res.message, Toast.type.ERROR);
    }
  }

  componentWillUnmount() {
    this.props.faq.setSearchInputValue('');
  }

  renderHeaderMiddle = () => {
    return <FaqHeaderView navigation={this.props.navigation} />;
  };

  handleFaqPress = (item, index) => {
    const quePlusAnswer =
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><h2>' +
      (index + 1 + `.`) +
      ' ' +
      item.question +
      '</h2> <br></body></html>' +
      item.answer;
    this.props.navigation.navigate('faqWebView', {
      answer: quePlusAnswer,
    });
  }

  render() {
    const { faqResultList, isLoading, faqSearchedResultList } = this.props.faq;
    const { localFaqResultList } = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
        accessible={false}>
        <View style={{ flex: 1 }}>
          {/* <Loader loading={isLoading} /> */}
          <Header
            navigation={this.props.navigation}
            hideBack
            // screenTitle={strings.locationScreen.screenTitle}
            middleComponent={this.renderHeaderMiddle()}
          />
          <FlatList
            data={
              this.props.faq.searchInputValue
                ? faqSearchedResultList
                : localFaqResultList
            }
            extraData={this.props.faq.searchInputValue}
            style={{ marginTop: 10 }}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => item + index}
            contentContainerStyle={
              faqSearchedResultList.length === 0 && styles.emptyScreenView
            }
            ListEmptyComponent={
              this.props.faq.isLoading ? null : <EmptyScreen searchResults />
            }
            renderItem={({ item, index }) => (
              <TouchableWithoutFeedback
                onPress={() => this.handleFaqPress(item, index)}>
                <View style={styles.itemContainer}>
                  <Text
                    style={{
                      color: '#515867',
                      fontSize: 12,
                      ...Specs.fontMedium,
                      flex: 0.9,
                    }}>
                    {`Q${index + 1}.   ${item.question}`}
                  </Text>
                  <Banner
                    styles={styles.forwardIcon}
                    resizeMode="contain"
                    source={FORWARD_IC0N}
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Faq;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 17,
    paddingRight: 34,
    backgroundColor: '#fff',
    borderBottomColor: '#c8c9d3',
    borderBottomWidth: 1,
  },
  forwardIcon: {
    width: 15,
    height: 18,
  },
  emptyScreenView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
