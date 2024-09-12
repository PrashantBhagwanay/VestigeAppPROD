import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AlertClass from 'app/src/utility/AlertClass';
import { observer, inject } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';

@inject('faq')
@observer
class FaqHeader extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      inputValue: ''
    }
  }

  render() {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
        >
          <Icon name='ios-arrow-back' size={30} color='#3f4967' style={styles.drawerIcon} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder={strings.faqScreen.inputPlaceholder}
            placeholderTextColor='gray'
            underlineColorAndroid='transparent'
            style={styles.searchCartInputContainer}
            onChangeText={(val) => {
              if (!val) {
                this.props.faq.resetFaqSearchedResultList()
              }
              this.props.faq.changeInputValue(val)
            }}
            onSubmitEditing={() => {
              if (this.props.faq.searchInputValue.trim().length <= 3) {
                AlertClass.showAlert(strings.faqScreen.errorAlertTitle,
                  strings.faqScreen.errorAlertMessage,
                  [
                    { text: 'Ok', onPress: () => console.log('Ok') }
                  ])
              }
              else {
                this.props.faq.fetchFaqSearchResults(this.props.faq.searchInputValue)
              }
            }}
            value={this.props.faq.searchInputValue}
          />
        </View>
      </View>
    )
  }
}

export default FaqHeader;

const styles = StyleSheet.create({
  drawerIcon: {
    // marginLeft: 16
  },
  searchContainer: {
    flex: 1,
  },
  searchCartInputContainer: {
    height: 45,
    fontSize: 18,
    color: '#a6a8b8',
    borderColor: 'white',
    paddingLeft: 18,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    // justifyContent: 'center',
    alignItems: 'center',
  },
})