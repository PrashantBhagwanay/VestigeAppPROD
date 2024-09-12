import React, { Component } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  Keyboard,
  FlatList,
  StyleSheet,
  ScrollView
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { observable , makeObservable} from 'mobx';
import { showToast } from 'app/src/utility/Utility';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import Loader  from 'app/src/components/loader/Loader';
import { CustomButton } from 'app/src/components/buttons/Button';
import AlertClass from 'app/src/utility/AlertClass';
import { Header } from '../../components';



@inject('dashboard', 'myConsistency')
@observer

export default class DynamicScreen extends Component {

  @observable myConsistencyData
  @observable isLoading = false
  @observable skipMonthDetailObject = null;

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const { showConsistencyData, isDynamicScreen } = this.props.route && this.props.route.params;
    if(showConsistencyData) {
      this.isLoading = true;
      const [consistencyResDetail, skipMonthDetail] = await Promise.all([await this.props.myConsistency.fetchConsistencyDetail(), await this.props.myConsistency.getSkipMonthData()])
      this.isLoading = false;
      if(skipMonthDetail.success) {
        this.skipMonthDetailObject = skipMonthDetail.data
      } 
      if(consistencyResDetail.success) {
        this.myConsistencyData = consistencyResDetail.data
      } 
      else {
        showToast(consistencyResDetail.message)
      }
    }
    if (isDynamicScreen) {
      this.isLoading = true;
      await this.props.dashboard.getDynamicScreenData();
      this.isLoading = false;
    }
  }

  renderSubChild = (item) => {
    return (
      <View style={styles.itemText}>
        <View style={{width: '50%',alignItems:'flex-start',paddingHorizontal: 5}}>
          <Text style={styles.listKeyStyles}>{item[0]}</Text>
        </View>
        <View style={{width: '50%',alignItems:'flex-end',}}>
          <Text style={styles.listValuesStyles}>{item[1]}</Text>
        </View>
      </View>
    )
  }

  renderChildItem = (item) => {
    return(
      <FlatList
        data={item}
        initialNumToRender={item?.length}
        extraData={item}
        style={{ marginTop: 10 }}
        keyboardShouldPersistTaps='handled'
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => this.renderSubChild(item)}
      />
    )
  }

  renderParentItem = (item) => {
    return (
      <View style={{ flex:1, padding:5,width:'100%'}}>
        <Text style={styles.listHeaderStyles}>{item.schemeText}</Text>
        <FlatList
          data={JSON.parse(item.datatable)}
          extraData={item.datatable}
          keyboardShouldPersistTaps='handled'
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => this.renderChildItem(Object.entries(item))}
        />
      </View>
    )
  }

  getSkipMonthData = async() => {
    AlertClass.showAlert('Consistency Message', 
      `${this.skipMonthDetailObject.content}`, 
      [{text: 'Yes', onPress: async() => {
        const res =  await this.props.myConsistency.putSkipMonth(this.skipMonthDetailObject.businessMonth)
        console.log(res)
        if(res.success) {
          this.skipMonthDetailObject = null
          this.isLoading = true
          const res = await this.props.myConsistency.fetchConsistencyDetail()
          if(res.success) {
            this.myConsistencyData = [...res.data]
          }
          this.isLoading = false
        }
      }},
      {text: 'No', onPress: () => console.log('OK Pressed')}])
  }

  render() {
    const { showConsistencyData } = this.props.route && this.props.route.params
    return (
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }} accessible={false}>
        <>
          <Header
            navigation={this.props.navigation}
            screenTitle={(this.props.route.params && this.props.route.params.showConsistencyData) ? 'My Consistency' : 'Extra Data'}
          />
          <ScrollView>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {
                showConsistencyData && this.skipMonthDetailObject && this.skipMonthDetailObject.isSkip === '1' ? (
                  <CustomButton
                    buttonContainer={styles.button}
                    handleClick={() => this.getSkipMonthData()}
                    linearGradient
                    buttonTitle='Skip First Month'
                    primaryColor="#6895d4"
                    secondaryColor="#57a5cf"
                    buttonTitleStyle={styles.customButtonTitleStyle}
                  />
                ) : null
              } 
              <Loader loading={this.isLoading} />
              <FlatList
                data={showConsistencyData ? this.myConsistencyData :this.props.dashboard.dynamicScreenList}
                extraData={this.props.dashboard.dynamicScreenList || this.myConsistencyData}
                style={{ marginTop: 10 }}
                keyboardShouldPersistTaps='handled'
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => this.renderParentItem(item)}
              />
            </View>
          </ScrollView>
        </>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  itemText :  { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  listHeaderStyles: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#3f4967',
    paddingHorizontal: 10
  },
  listKeyStyles: {
    ...Specs.fontMedium,
    color: '#414456',
    fontSize: 14,
  },
  listValuesStyles: {
    ...Specs.fontSemibold,
    color: '#31cab3',
    fontSize: 14,
  },
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: 'transparent',
    width:'80%',
    marginTop: 30
  },
})
