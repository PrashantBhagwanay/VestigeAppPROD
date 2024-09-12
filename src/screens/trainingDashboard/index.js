import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import Loader from '../../components/loader/Loader';
import { Header } from '../../components';
import { strings } from '../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../utility/Theme';
import AlertClass from '../../utility/AlertClass';
import { TrainingRequestType } from '../../utility/constant/Constants';


const SCREEN_WIDTH = Dimensions.get('window').width

@inject('training', 'auth', 'appConfiguration')
@observer
class TrainingRequest extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      distributorId: this.props.auth.distributorID,
      headingMsg: ''
    };
  }

  async componentDidMount(){
    await this.validateTrainer()
  }

  validateTrainer = async () => {
    const res = await this.props.training.validateTrainer(
      this.state.distributorId,
      TrainingRequestType.CNT,
    );
    if(res?.data && res?.data.hasOwnProperty('headingMsg')){
      this.setState({
        headingMsg: res?.data?.headingMsg
      })
    }
  }

  onPressTrainingRequest = async () => {
    const res = await this.props.training.validateTrainer(
      this.state.distributorId,
      TrainingRequestType.CNT,
    );
    const { success, message, data } = res;
    const { commonMessages } = strings;
    if (!success) {
      AlertClass.showAlert('', message, [
        { text: commonMessages.ok, onPress: () => null },
      ]);
      return;
    }

    if (data?.isEligible === '1') {
      this.props.navigation.navigate('trainingRequestForm');
    } else {
      AlertClass.showAlert(
        '',
        data?.alertMsg ||
          `${commonMessages.somethingWentWrong}${commonMessages.tryAgain}`,
        [{ text: commonMessages.ok, onPress: () => null }],
      );
    }
  };

  onPressTrainingList = () => {
    this.props.navigation.navigate('trainingRequestList');
  };

  onPressFutureDistributor = () => {
    // this.props.navigation.navigate('addProspects');
    this.props.navigation.navigate('completedRequestList');
    // this.props.navigation.navigate('claimentInfo');
    // this.props.navigation.navigate('claimOthersTotal');
    
  }

  fetchTrainingModules = () => {
    const trainingModules = [
      {
        id: 0,
        placeholder: strings.trainingRequestScreen.trainingRequest,
        onPress: this.onPressTrainingRequest,
        styleOverride: {},
        textStyle: { color: COLOR_CODES.defaultBlue },
        icon: require('../../assets/images/trainingRequest/trainingRequest.png'),
        isEnabled: true,
      },
      {
        id: 1,
        placeholder: strings.trainingRequestScreen.trainingList,
        onPress: this.onPressTrainingList,
        styleOverride: {},
        textStyle: { color: COLOR_CODES.brightCyan },
        icon: require('../../assets/images/trainingRequest/list.png'),
        isEnabled: true,
      },
      {
        id: 2,
        placeholder: strings.trainingRequestScreen.completedTraining,
        onPress: this.onPressFutureDistributor,
        styleOverride: { },
        textStyle: { color: COLOR_CODES.brightCyan },
        icon: require('../../assets/images/trainingRequest/list.png'),
        isEnabled: true,
      },
    ];

    return trainingModules;
  };

  renderModuleButtons = item => {
    return (
      <>
        <TouchableOpacity
          style={[styles.button, item?.styleOverride]}
          onPress={() => item?.onPress()}>
          <Image style={styles.icon} source={item.icon} resizeMode="contain" />
          <Text style={[styles.buttonText, item.textStyle]}>
            {item?.placeholder}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  render() {
    return (
      <>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.trainingDashboard}
        />
        <Loader loading={this.props.training.isLoading} />
        <View style={styles.main}>
          <Text style={styles.headingMsgText}>{this.state.headingMsg}</Text>
          <FlatList
          columnWrapperStyle={{ flex: 1/3,}}
          contentContainerStyle={{ justifyContent: 'space-around',}}
            style={styles.listContainer}
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
            data={this.fetchTrainingModules()}
            renderItem={({ item }) => this.renderModuleButtons(item)}
          />

    
        </View>
        
      </>
    );
  }
}

export default TrainingRequest;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  button: {
    // flex: 1,
    height: 100,
    padding: 10,
    margin: 15,
    backgroundColor: COLOR_CODES.white,
    borderWidth: 1,
    borderColor: COLOR_CODES.border,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: Dimensions.get('window').width /2 - 50,
    flex:0.5,
  },
  buttonText: {
    ...Specs.fontBold,
    fontSize: 14,
    textAlign: 'center',
  },
  icon: {
    height: 40,
    width: 40,
  },
  headingMsgText: {
    fontSize:12, 
    color: COLOR_CODES.vividRed
  }
});
