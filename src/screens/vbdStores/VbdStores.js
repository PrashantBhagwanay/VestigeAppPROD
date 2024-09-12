import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { Icon } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { connectedToInternet } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { observable, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';

@inject('vbd', 'location', 'profile', 'branches')
@observer
class VbdStores extends Component {
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      stateName:
        this.props.profile.activeAddress &&
        this.props.profile.activeAddress.state
          ? this.props.profile.activeAddress.state
          : '',
    };
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    await this.props.location.stateList(this.props.profile.countryId);
    await this.props.vbd.fetchVbdStoresData(this.state.stateName);
  }

  setStateValue = (itemValue) => {
    let arrState = this.props.location.getStateNameList
    this.props.branches.setSelectedBranchState(itemValue)
    let stateObj = {}
     for(i = 0; i<arrState.length ; i++){
       if(arrState[i].stateName == itemValue){
        stateObj = arrState[i]
       }
     }
    if(stateObj.stateName){
      this.setState({ stateName: stateObj.stateName }, async()=>{
        this.props.vbd.setVbdStoresData([])
        await this.props.vbd.fetchVbdStoresData(this.state.stateName);
      })
    }
  };

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.props.vbd.fetchVbdStoresData(this.state.stateName);
    }
  }

  showDetailedCell=(item)=>{
    if(item.id && this.props.vbd.storeId !== item.id){
      this.props.vbd.setStoreId(item.id);
    } 
    else{
      this.props.vbd.setStoreId('')
    }
  };

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = item => {
    this.setStateValue(item.stateName);
    this.handleModalVisibility(false);
  };

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  showArrowIcon = item => {
    if (item.id === this.props.vbd.storeId) {
      return (
        <Icon name="arrow-up" type="simple-line-icon" color="black" size={16} />
      );
    } else {
      return (
        <Icon
          name="arrow-down"
          type="simple-line-icon"
          color="black"
          size={16}
        />
      );
    }
  };

  detailedCell = item => {
    if (item.id === this.props.vbd.storeId) {
      return (
        <View style={{ paddingTop: 15, padding: 10 }}>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.contactNo}</Text>
            <Text style={{ flex: 0.6 }}>
              {item.main_phone ? item.main_phone : '0'}
            </Text>
          </View>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.address}</Text>
            <Text style={{ flex: 0.6 }}>
              {item.address_line_1 ? item.address_line_1 : '0'}
              {'\n'}
              {item.address_line_2 ? item.address_line_2 : '0'}
            </Text>
          </View>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.email}</Text>
            <Text style={{ flex: 0.6 }}>{item.email ? item.email : '0'}</Text>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  render() {
    const { vbdStoresData, isLoading } = this.props.vbd;
    return (
      <View style={{ flex: 1 }}>
        {!this.isInternetConnected && (
          <OfflineNotice networkStatus={status => this.networkStatus(status)} />
        )}
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.vbdStores.title}
        />
        <View
          style={{
            top: 20,
            paddingLeft: 20,
            width: '100%',
            height: 120,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 15 }}>State Name</Text>
          {/* <Picker
            selectedValue={this.state.stateName}
            mode="dropdown"
            style={{ width: '100%' }}
            onValueChange={itemValue => this.setStateValue(itemValue)}>
            {this.renderStatePickerItems(this.props.location.getStateNameList)}
          </Picker>
          <View style={styles.horizontalLine} /> */}
          <PickerSelector
            label={this.state.stateName || 'Select a value'}
            selectedValue={this.state.stateName}
            customStyle={{
              container: {
                marginHorizontal: 0,
                marginRight: 20,
              },
            }}
            onPickerPress={this.handlePickerSelector}
          />
        </View>
        <FlatList
          data={vbdStoresData}
          style={{ backgroundColor: '#f2f5f8' }}
          extraData={this.props.vbd.storeId}
          contentContainerStyle={
            vbdStoresData.length === 0 && styles.emptyScreenView
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#5988e0" />
            ) : (
              <EmptyScreen searchResults />
            )
          }
          renderItem={({ item }) => {
            return (
              <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                <View style={styles.cellView}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#31cab3' }}>
                      {item.warehouse_name}
                    </Text>
                  </View>
                  {this.detailedCell(item)}
                </View>
                <TouchableOpacity
                  style={styles.accordionArrow}
                  onPress={() => this.showDetailedCell(item)}>
                  {this.showArrowIcon(item)}
                </TouchableOpacity>
              </View>
            );
          }}
        />
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          onModalClose={() => this.handleModalVisibility(false)}
          pickerItems={this.props.location.getStateNameList}
          schema={{ label: 'stateName', value: 'stateName' }}
          heightMax={500}
          onItemPress={this.handlePickerItemPress}
        />
      </View>
    );
  }
}

export default VbdStores;

const styles = StyleSheet.create({
  cellView: {
    zIndex: -1,
    backgroundColor: '#fff',
    paddingBottom: 25,
    paddingTop: 15,
    paddingLeft: 10,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  accordionArrow: {
    elevation: 3,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 3,
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  detailedCart: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 5,
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#c8c9d3',
  },
});
