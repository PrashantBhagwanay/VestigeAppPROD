/**
 * @description Use to make My Training screen
 */
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  FlatList,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { connectedToInternet } from 'app/src/utility/Utility';
import MyTrainingTop from 'app/src/screens/myTraining/myTrainingComponent/MyTrainingTop';
import MyTrainingItem from 'app/src/screens/myTraining/myTrainingComponent/MyTrainingItem';
import TrainingCell from 'app/src/screens/myTraining/myTrainingComponent/TrainingCell';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import { Specs } from 'app/src/utility/Theme';
import Loader  from 'app/src/components/loader/Loader';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { observable, makeObservable } from 'mobx';
import { TrainingTypeEnum, MyTrainingTypeEnum, UserRole } from 'app/src/utility/constant/Constants';
// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import autobind from 'autobind-decorator';
import { Header } from '../../components';

const trainingData = [
  {
    title: TrainingTypeEnum.Training,
  },
  {
    title: TrainingTypeEnum.MyTraining,
  },
];

/**
 * @description It contains the complete my training design
 */
@inject('training','auth')
@observer
export default class MyTraining extends Component {
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedTrainingType: TrainingTypeEnum.MyTraining,
      selectedType: MyTrainingTypeEnum.Approved,
      trainingData:[],
      myTrainingData:[],
    };
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  } 

  @autobind
  async getComponentData() {
    const {training, navigation, route} = this.props;
    let isTraining = false 

    let isData = false
    if(route.params) {
      let {data} = route.params;
      if(data && data.isTraining) {
        isTraining = route.params.isTraining
      }
      if(data && data.name !== null) {
        isData = true
      }
    }
    console.log(isTraining)
    if(isTraining){
      await this.setState({
        selectedTrainingType:TrainingTypeEnum.Training,
      })
    } 
    else if(this.props.auth.userRole === UserRole.Distributor && isData === false) {
      await this.setState({
        selectedTrainingType:TrainingTypeEnum.Training,
      })
    }

    let isFromEvent = this.isFromMain()
    if(!isFromEvent){
      let {data} = route.params;
      if(data && !data.id) {
        let myTrainingData =  training.getTrainingDetail();
        if (myTrainingData.length > 0) {
          this.setState({
            myTrainingData:myTrainingData,
          })
        } 
      }
      else{
        // Call API
        let event = ''
        if(data && data.code !== null) {
          event = data.code
        }
        let myTrainingData = await training.getTariningDetailWithEvent(event);
        if (myTrainingData.length > 0) {
          this.setState({
            myTrainingData:myTrainingData,
          })
        }
      }
     
    } 
    else {
      this.myTrainingList();
      let trainingData = await training.trainingListAPI();
      if (trainingData.length > 0) {
        this.setState({
          trainingData:trainingData,
        })
      } 
    }
  }

  /**
  * @description
  * handling the click of buttons
  */
  handleTabCallback = (type) => {
    const userRole = this.props.auth.userRole;
    if(userRole === UserRole.Distributor){
      return
    }
    
    const {  selectedTrainingType } = this.state;
    if(type!==selectedTrainingType){
      this.setState({
        selectedTrainingType:type,
      })
    }
  }

  handleFilterCallback = async (type) => {
    const {  selectedType } = this.state;
    if(type!==selectedType){
      await this.setState({
        selectedType:type,
      })
      await this.myTrainingList();
    }
  }
  
  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.getComponentData()
  }

  myTrainingList = async () => {
    const {training} = this.props;
    const {selectedType} = this.state;
    let myTrainingData = await training.myTrainingListAPI(selectedType);
    if (myTrainingData) {
      this.setState({
        myTrainingData:myTrainingData,
      })
    } 
  }

  makeListCell = () => {
    const { navigation } = this.props;
    let {selectedTrainingType, myTrainingData, trainingData} = this.state;
    let show = this.isFromMain()
    if(selectedTrainingType===TrainingTypeEnum.MyTraining){
      // if(myTrainingData.length > 0){
      return(
        <FlatList 
          data={myTrainingData.length > 0 ? myTrainingData : []}
          extraData={selectedTrainingType} 
          keyExtractor={(_, i) => i}
          contentContainerStyle={myTrainingData.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={this.props.training.isLoading ? null : <EmptyScreen searchResults />}
          renderItem={({item}) => <MyTrainingItem item={item} isMain={show} navigation={navigation} />}
        />
      ); 
      // }
    }
    else{
      // if(trainingData.length > 0){
      return(
        <FlatList 
          data={trainingData}
          extraData={selectedTrainingType} 
          keyExtractor={(_, i) => i}
          contentContainerStyle={trainingData.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={this.props.training.isLoading ? null : <EmptyScreen searchResults />}
          renderItem={({item}) => <TrainingCell navigation={navigation} item={item} />}
        />
      );
      // }
    }
  }

  isFromMain = () => {
    const { route } = this.props;
    let show = true;
    if(route.params) {
      let {data} = route.params;
      if(data && data !==undefined) {
        show=false
      }
    }
    return show
  }

  render() {
    const {selectedTrainingType} = this.state;
    const {training } = this.props;
    
    let show = this.isFromMain()
    return(
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={training.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route?.params?.data?.name || 'Training'}
        />
        {show ? (
          <>
            <CustomTopTab showTabDivider selectedValue={selectedTrainingType} handleTabCallback={this.handleTabCallback} data={trainingData} />
            {selectedTrainingType === TrainingTypeEnum.MyTraining ? <MyTrainingTop handleFilterCallback={this.handleFilterCallback} /> : null}  
          </>
          ) : null
        }
        {this.makeListCell()}
      </View>
    );
  }
}

/**
 * @description: This is the custom stylesheet for my training
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    backgroundColor: '#f2f5f8',
    flex: 1,
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
});