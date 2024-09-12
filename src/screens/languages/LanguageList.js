/**
 * @description Location Screen user set his location manually or automatically
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Image,
  SafeAreaView
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { RadioButton } from 'app/src/components/buttons/Button';
import { setLanguage, getLanguage, languages } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';

const logo = require('../../assets/images/logo/logo.png');
const SELECTED_lANGUAGE = AsyncStore.addPrefix('selectedLanguage');

export default class LanguageList extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedValue: '',
    }
  }

  /**
   * @function toggle radio button here
   */
  radioButton = async (item) => {
    const { navigation } = this.props;
    setLanguage(item.language);
    await AsyncStore.set(SELECTED_lANGUAGE, item.language);
    this.setState({
      selectedValue: item.title,
    });
    navigation.navigate('onBoarding');
  }

  renderRadioButton = ({item}) => {
    const { selectedValue } = this.state;
    return (
      <RadioButton
        textStyle={styles.title}
        buttonText={item.title}
        onPress={() => this.radioButton(item)}
        selectedValue={selectedValue}
      />
    )
  }

  render(){
    const { selectedValue } = this.state;

    return(
      <SafeAreaView style={styles.container}>
        <Image style={{ alignSelf:'center', marginTop: 45, marginBottom: 15}} source={logo} />
        <Text style={styles.screenTitle}>Select Your Preferred Language</Text>
        <FlatList 
          data={languages}
          style={styles.flatList}
          renderItem={this.renderRadioButton}
          extraData={selectedValue} 
          keyExtractor={(_, index) => index.toString()}
        />
      </SafeAreaView>
    )
  }
}

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  screenTitle: {
    ...Specs.fontMedium,
    fontSize: 18,
    marginTop: (Platform.OS === 'ios') ? 34: 14, 
    marginLeft: 17, 
    color: '#3f4967', 
  },
  title: {
    ...Specs.fontMedium,
    fontSize: 50,
    color: 'red', 
  },
  flatList: {
    paddingVertical:10
  }
})