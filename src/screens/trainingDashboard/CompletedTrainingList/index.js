import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../components';
import { strings } from '../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../utility/Theme';
import TrainingRequestListItem from './component/TraningRequestListItem';
import { TrainingRequestType } from '../../../utility/constant/Constants';
import { BottomSheetPicker } from '../../../components/picker/bottomSheetPicker';
import AlertClass from '../../../utility/AlertClass';
import { Toast } from '../../../components/toast/Toast';
import { showToast } from '../../../utility/Utility';
import Geolocation from '@react-native-community/geolocation';
import * as Permissions from 'app/src/utility/permissions/Permissions';
import { promptToOpenSettings } from 'app/src/utility/Utility';
import { observable, action, runInAction, makeObservable } from 'mobx';

export const TRAINING_STATUS_ENUM = {
  COMPLETED: 'Completed'
};

const TRAINING_TYPE_LIST = [
  TRAINING_STATUS_ENUM.COMPLETED
];

@inject('training', 'auth', 'appConfiguration')
@observer
class TrainingRequestList extends Component {

  @observable latitude;
  @observable longitude;
  
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      trainingList: [],
      rejectReasons: [],
      selectedTrainingData: {},
      isModalVisible: false,
      isListRefreshing: false,
      // latitude: '',
      // longitude: '',
      modalSchema: { label: 'label', value: 'value' },
    };
  }

  componentDidMount() {
    this.getRequestedTrainingList();
    // this.getRejectReasons();
    this.getGeoLocation();
  }

  getGeoLocation = async () => {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          runInAction(() => {
          console.log('Position',position)
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          // this.setState({ latitude:  position.coords.latitude, longitude: position.coords.longitude});
          })
          // this.detectLocation();
        },
        () => {
          // this.showToast(strings.errorMessage.location.enableLocation, Toast.type.ERROR)
        },
        { enableHighAccuracy: true },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    }
  }

  async getRequestedTrainingList() {
    const res = await this.props.training.fetchRequestedTrainingList(
      this.props.auth.distributorID,
      TrainingRequestType.CNT,
    );
    if (res.success && Array.isArray(res.data)) {
      this.setState({
        trainingList: res.data,
      });
    }
  }

  async getRejectReasons() {
    const res = await this.props.training.fetchRejectReasons();
    if (res?.success && Array.isArray(res?.data)) {
      this.setState({
        rejectReasons: res?.data,
        modalSchema: { label: 'RejectReason', value: 'RejectReasonId' },
      });
    }
  }

  searchWord = (text, word) => {
    var x = 0, y=0;
    for (i=0;i< text.length;i++)
        {
        if(text[i] == word[0])
            {
            for(j=i;j< i+word.length;j++)
               {
                if(text[j]==word[j-i])
                  {
                    y++;
                  }
                if (y==word.length){
                    x++;
                }
            }
            y=0;
        }
    }
   return x === 0 ? false : true;
  }

  deleteTrainingRequest = async item => {
    const res = await this.props.training.deleteTrainingRequest(
      this.state.selectedTrainingData?.TrainingRequestID,
      item?.RejectReasonId,
    );
    if (res.success) {
      AlertClass.showAlert('', res?.data[0]?.msg, [
        {
          text: strings.commonMessages.ok,
          onPress: () => this.getRequestedTrainingList(),
        },
      ]);
    } else {
      showToast(res.message, Toast.type.ERROR);
    }
    this.setState({ selectedTrainingData: {}, isModalVisible: false });
  };

  handlePickerItemPress = item => {
    AlertClass.showAlert('', 'Do you want to cancel this request?', [
      { text: 'Cancel', onPress: () => console.log('OK Pressed') },
      {
        text: 'Confirm',
        onPress: () => this.deleteTrainingRequest(item),
      },
    ]);
  };

  handleModalVisibility = value => {
    this.setState({ isModalVisible: value });
  };

  onPressCancel = item => {
    this.setState({ selectedTrainingData: item });
    AlertClass.showAlert('', 'Do you want to delete this request?', [
      { text: 'Cancel', onPress: () => console.log('OK Pressed') },
      {
        text: 'Confirm',
        onPress: () => this.deleteTrainingRequest(item),
      },
    ]);
  };

  onListRefresh = async () => {
    this.setState({
      isListRefreshing: true
    },async function(){
      await this.getRequestedTrainingList();
      // await this.getRejectReasons();
      // await this.refreshStarredList(this.props.network.favoriteDownlineData);
    })
    this.setState({
      isListRefreshing: false
    })
  }

  render() {
    const { trainingList } = this.state;
    // console.log('latitude',this.latitude, 'longitude', this.longitude)
    return (
      <View style={{flex: 1}}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.trainingRequestScreen.trainingList}
        />
  
          <FlatList
            data={trainingList}
            extraData={trainingList}
            keyExtractor={(item, index) => item + index}
            refreshing={this.state.isListRefreshing}
            onRefresh={() => this.onListRefresh()}
            ListEmptyComponent={
              <>
                <Text
                  style={{
                    ...Specs.fontBold,
                    color: COLOR_CODES.black,
                    textAlign: 'center',
                  }}>
                  {strings.trainingRequestScreen.emptyScreenMessages}
                </Text>
              </>
            }
            contentContainerStyle={
              trainingList?.length === 0 && styles.emptyScreenView
            }
            renderItem={({ item }) => (
              <TrainingRequestListItem
                item={item}
                handleMessage={value => console.log('value', value)}
                navigation={this.props.navigation}
                handleCancelPress={this.onPressCancel}
                onRefresh={this.onListRefresh}
                isListRefreshing={this.state.isListRefreshing}
                // latitude={this.latitude}
                // longitude={this.longitude}
              />
            )}
          />
          <BottomSheetPicker
            isVisible={this.state.isModalVisible}
            onModalClose={() => this.handleModalVisibility(false)}
            pickerItems={this.state.rejectReasons}
            heightMax={Dimensions.get('window').height / 2}
            customStyles={{
              bottomSheetItemText: {
                textAlign: 'center',
              },
            }}
            title="Select Cancel Reason"
            onItemPress={this.handlePickerItemPress}
            schema={this.state.modalSchema}
          />

      </View>
    );
  }
}

export default TrainingRequestList;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
