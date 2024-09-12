import React, { Component } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Linking, Platform, Image } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { strings } from 'app/src/utility/localization/Localized';
import { showToast } from 'app/src/utility/Utility';
import { Icon } from 'react-native-elements';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import Banner from 'app/src/screens/Dashboard/Banner';
import { observer, inject } from 'mobx-react';
import Loader from 'app/src/components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import Share from 'react-native-share';
import { Header } from '../../components';
import PickerSelector from '../../components/picker/pickerSelector';
const STAR_IMAGE = require('app/src/assets/images/ProductsRating/star.png');
import { PICKER_ENUM } from '../../utility/constant/Constants';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';

const { height, width } = Dimensions.get('window');
const branchTabTitle = [
  { title: strings.branchesScreen.branchDetails },
  { title: strings.branchesScreen.minidlcp },
  { title: strings.branchesScreen.districtLevelContact },
  { title: strings.branchesScreen.districtLevelCentre },
  { title: strings.branchesScreen.onlineDistbutorDetails },

  
  
];
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');

@inject('branches', 'location')
@observer

export default class Branches extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedBranch: branchTabTitle[0].title,
      branchType: 'Branch',
      isModalVisible: false,
    };
  }

  async componentDidMount() {
    await this.getBranchDetails();
  }

  showArrowIcon = (item) => {
    const arrowUp = item.address === this.props.branches.branchAddress;
    return (
      <Icon
        name={arrowUp ? 'arrow-up' : 'arrow-down'}
        type='simple-line-icon'
        color='black'
        size={16}
      />
    )
  }

  getBranchDetails = async () => {
    const res = await this.props.branches.fetchBranchDetails(this.state.branchType, this.props.route?.params?.stateId, this.props.route?.params?.cityId);
    if (!res.success) {
      showToast(res.message, Toast.type.ERROR);
    }
    this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: true });
  }

  handleTabCallback = (type) => {
    const { selectedBranch } = this.state;
    const typeAfterRemovingNewLine = type.replace(/(\r\n|\n|\r)/gm, '');
    const finalType = typeAfterRemovingNewLine.replace(/ /g, '')
    console.log('finalType==>'+finalType);
    if (type !== selectedBranch) {
      if (finalType == 'DistributorConsultingCenterDetails') {
        this.setState({
          selectedBranch: type,
          branchType: 'DCC'
        }, async () => {
          await this.getBranchDetails()
        })
      }
      else if (finalType == 'DistrictLevelContactPointsDetails(Dlcp)') {
        this.setState({
          selectedBranch: type,
          branchType: 'DLCP'
        }, async () => {
          await this.getBranchDetails()
        })
      }else if (finalType == 'OnlineDistributorConsultingCenterDetails') {
        this.setState({
          selectedBranch: type,
          branchType: 'ODCC'
        }, async () => {
          await this.getBranchDetails()
        })
      } else if (finalType == 'DistrictLevelContactpointDetails(MiniDlcp)') {
        this.setState({
          selectedBranch: type,
          branchType: 'MiniDlcp'
        }, async () => {
          await this.getBranchDetails()
        })
      } else {
        this.setState({
          selectedBranch: type,
          branchType: 'Branch'
        }, async () => {
          await this.getBranchDetails()
        })
      }
    }
  }

  showDetailedCell = (item) => {
    if (item.address && this.props.branches.branchAddress !== item.address) {
      this.props.branches.setBranchAddress(item.address);
    }
    else {
      this.props.branches.setBranchAddress('')
    }
  }


  detailedCell = (item) => {
    if (item.address === this.props.branches.branchAddress) {
      return (
        <View style={{ paddingTop: 15, padding: 10 }}>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.contactNo}</Text>
            <Text style={{ flex: 0.6 }}>{item.contactNumbers ? item.contactNumbers : ''}</Text>
          </View>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.address}</Text>
            <Text style={{ flex: 0.6 }}>
              {item.address ? item.address : ''}
            </Text>
          </View>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>{strings.vbdStores.email}</Text>
            <Text style={{ flex: 0.6 }}>{item.email ? item.email : ''}</Text>
          </View>
          <View style={styles.detailedCart}>
            <Text style={{ flex: 0.4 }}>Weekly Off</Text>
            <Text style={{ flex: 0.6 }}>{item.weeklyOff ? item.weeklyOff : ''}</Text>
          </View>
        </View>
      );
    }
    return null
  }

  openGoogleMaps = (locationLatitude,locationLongitude, branchName) => {
    if (locationLatitude&&locationLongitude) {
      const latitude=locationLatitude;
      const longitude=locationLongitude;
      // const { latitude, longitude } = branchCoordinate
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${latitude},${longitude}`;
      const label = `${branchName}`;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url);
    }
    else {
      showToast(strings.branchesScreen.noCoordinatesFound)
    }
  }

  shareLocation = (branchCoordinate) => {
    if (branchCoordinate) {
      const { latitude, longitude } = branchCoordinate
      const shareData = {
        failOnCancel: false,
        url: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        title: 'Share Branch Directions'
      }
      console.log(shareData)
      Share.open(shareData);
    }
    else {
      showToast(strings.branchesScreen.noCoordinatesFound)
    }
  }

  getModalSchema = () => {
    switch (this.state.selectPickerList) {
      case PICKER_ENUM.STATE_PICKER:
    
          return { label: 'title', value: 'stateId' };
      default:
        return { label: 'title', value: 'value' };
    }
  };
  handlePickerItemPress = item => {
    switch (this.state.selectPickerList) {
    
      case PICKER_ENUM.STATE_PICKER:
        this.handleTabCallback(item.title)
        // alert(JSON.stringify(item));
        break;
  
      default:
        break;
    }
    this.closeBottomSheet();
  };


  handlePickerSelector = type => {
   
    this.setState({
      selectPickerList: type,
      isModalVisible: true,
    });
  }
  closeBottomSheet = () => {
    this.setState({
      selectPickerList: '',
      isModalVisible: false,
    });
  };
  getPickerData = () => {
    switch (this.state.selectPickerList) {
  
      case PICKER_ENUM.STATE_PICKER:
        return branchTabTitle;

      default:
        return [{}];
    }
  };


  render() {
    const { selectedBranch, branchType } = this.state;
    return (
      <View style={styles.container}>
        <Loader loading={this.props.branches.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.branches}
        />
        {/* <CustomTopTab
          selectedValue={selectedBranch}
          showTabDivider
          handleTabCallback={this.handleTabCallback}
          data={branchTabTitle}
          style={{ marginBottom: 10 }}
          textStyle={{ fontSize: height < 680 ? 8 : 10, }}
        /> */}

       <View style={{ marginBottom: 5, marginLeft:15, marginRight:15 }}>
            
              <PickerSelector
                label={this.state.selectedBranch || 'Select Branch Type'}
                selectedValue={this.state.selectedBranch}
                customStyle={{
                  container: {
                    backgroundColor:"#FFF",
                    borderColor:"#a1f7b8",
                  
                    marginHorizontal: 0,
                    textStyle:{
                      color: "#FFF",
                    }
                  },
                }}
                onPickerPress={() =>
                  this.handlePickerSelector(PICKER_ENUM.STATE_PICKER)
                }
              />
            </View>

        <FlatList
          style={{ paddingTop: 0 }}
          data={this.props.branches.branchDetails}
          extraData={this.props.branches.branchAddress}
          contentContainerStyle={this.props.branches.branchDetails?.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={this.props.branches.isLoading ? null : <EmptyScreen searchResults />}
          ref={(ref) => { this.flatListRef = ref }}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => {
            return (
              <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                <View style={styles.cellView}>
                  <View style={styles.itemHeading}>
                    <Text style={styles.idText} numberOfLines={4}>{item.pName ? item.pName : ''}</Text>
                    <Text style={styles.nameText} numberOfLines={2}>{item.name ? item.name : ''}</Text>
                    {/* {
                    branchType === 'MB' && (
                      <TouchableWithoutFeedback 
                        onPress={()=> this.openGoogleMaps(item.geoLocation, item.pName)}
                      >
                        <Icon 
                          type='entypo'
                          name='location-pin'
                          color='#373e73'
                          size={30}
                        />
                      </TouchableWithoutFeedback>
                    )
                  } */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <TouchableWithoutFeedback
                        onPress={() => this.openGoogleMaps(item.locationLatitude,item.locationLongitude, item.pName)}
                      >
                        <Icon
                          type='entypo'
                          name='location-pin'
                          color='#373e73'
                          size={30}
                        />
                      </TouchableWithoutFeedback>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => this.shareLocation(item.geoLocation)}
                      >
                        <Banner
                          styles={{ height: 30, marginHorizontal: 10 }}
                          source={SHARE_IMAGE}
                          resizeMode='contain'
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {(item.averageRating != "0.0" && item.averageRating != "0" && item.averageRating != null && item.averageRating != undefined) &&
                  <View style={{marginLeft:width-130, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 80, paddingHorizontal: 10, height: 40, borderRadius: 5, backgroundColor: '#6797d4' }}>
                    <Image source={STAR_IMAGE} style={{ width: 20, height: 20 }}></Image>

                    <Text style={{ marginLeft: 10, color: 'white', fontWeight: '700', fontSize: 18 }} >{item.averageRating}</Text>
                  </View>
                  }
                  {this.detailedCell(item)}
                </View>
                <TouchableOpacity
                  style={styles.accordionArrow}
                  onPress={() => this.showDetailedCell(item)}
                >
                  {this.showArrowIcon(item)}
                </TouchableOpacity>
                


              </View>
            )
          }}
        />

       <BottomSheetPicker
              isVisible={this.state.isModalVisible}
              onModalClose={this.closeBottomSheet}
              pickerItems={this.getPickerData()}
              schema={this.getModalSchema()}
              heightMax={(2 / 3) * height}
              onItemPress={this.handlePickerItemPress}
            />

      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 8
  },
  idText: {
    ...Specs.fontMedium,
    fontSize: 16,
    color: '#515867',
    width: '30%',
    flex: 0.4
  },
  nameText: {
    ...Specs.fontRegular,
    fontSize: 16,
    color: '#515867',
    width: '50%',
    flex: 0.6
  },
  itemHeading: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 10
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    marginLeft: 8,
    height: 25,
    width: 25,
  }
})