//@flow

import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  ScrollView
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react';
import Loader from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import { commaSeperateAmount, connectedToInternet, valueFormatter } from 'app/src/utility/Utility';
import { observable, makeObservable } from 'mobx';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';
import MultiLineChart from '../../components/chartComponent/MultiLineChart';
const deviceWidth = (Dimensions.get('window').width) * 0.94
const deviceHeight = (Dimensions.get('window').height) * 0.3
const viewHeight = (Dimensions.get('window').height) * 0.52

const chartViewHeight = Dimensions.get('window').height * 0.52;

var Color = ['#f8bb56',]

@inject('profile')
@observer
class DownlinePvGraph extends Component {
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = {
      pvData: this.props.route.params.pvData,
      startDate:this.props.route.params.startDate,
      endDate:this.props.route.params.endDate,
      completeData :[],
      finalData: [0],
      leftAxisData :[0],
      bottomAxisData:[],
      minX:'',
      minY: 0,
      maxX:'',
      maxY:'',
      bottomAxisDatatoShow :[],
      selectedValue:'',
      leftAxisDataToShow:[]
    }
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.getComponentData();
  }

  @autobind
  async getComponentData() {
    const { profile ,navigation} = this.props;
    const downlineId = this.state.pvData.distributorId;
    const type = 'selfPv';
    console.log('respvdata',this.state.pvData.distributorId);
    await this.props.profile.fetchUserPointHistory(downlineId);
    const length = profile.graphPvValue.length;
    console.log('reslength',length)
    if(profile.graphPvValue.length > 0){
      await this.setData(type);
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  }

  // renderDate = () => {
  //   const { startDate, endDate } = this.state
  //   return (
  //     <Text style={styles.dataMonths}>
  //       {startDate}
  //       {' '}
  //       -
  //       {' '}
  //       {endDate}
  //     </Text>
  //   )
  // }

  setData(type) {
    const {profile} = this.props
    this.state.completeData = []
    this.state.leftAxisData =[0],
    this.state.bottomAxisData=[],
    this.state.minX='',
    this.state.minY= 0,
    this.state.maxX='',
    this.state.maxY='',
    this.state.bottomAxisDatatoShow =[],
    this.state.leftAxisDataToShow=[0]
    var {bottomAxisData, completeData, leftAxisData, bottomAxisDatatoShow, leftAxisDataToShow} = this.state;
    var minValueArray=[];
    var demoData=[]
    profile.graphPvValue.map((userData, index) => {
      demoData?.push(JSON.parse(userData[type]));
      this.setState({ finalData: demoData });
      minValueArray.push(userData[type])
      bottomAxisData.push(index)
      bottomAxisDatatoShow.push(userData.bussinessMonth)
    });
    completeData.push(demoData)
    if((Math.max(...minValueArray))< 6){
      var slab = 1
    }
    else{
      slab = Math.round((Math.max(...minValueArray))/6);
    }
    for(let i = 0;i <= 6;i++){
      leftAxisData.push((Math.max(...leftAxisData)+slab))
      leftAxisDataToShow.push(valueFormatter(Math.max(...leftAxisData)+slab))
    }
    this.state.minX = Math.min(...bottomAxisData)
    this.state.maxX = Math.max(...bottomAxisData)
    this.state.maxY = Math.max(...leftAxisData)
    this.setState({
      selectedValue:type
    })
  }

  renderLineGraph = () => {
    const { 
      completeData,
      leftAxisData,
      bottomAxisData,
      maxX,
      maxY,
      minX,
      minY,
      bottomAxisDatatoShow,
      selectedValue, 
      leftAxisDataToShow
    } = this.state;
    const {profile} = this.props;
    // const { startDate, endDate, pvData } = this.state
    // const { date1PV = 0, date2PV = 0 } = pvData
    // // const  date1PV = 100
    // // const date2PV = 200
    // console.log('graph data',date1PV, date2PV, startDate, endDate)
    // var data = [[
    //   { 'x': 1, 'y':date1PV},
    //   { 'x': 2, 'y':date2PV},
    // ]]
    // const maxPV = date1PV > date2PV ? date1PV : date2PV
    // let bottomAxisDataToShow = [startDate, endDate]
    // let bottomAxisData = [1, 2]

    // let leftAxisDataToShow = [0, maxPV]
    // let leftAxisData = [0, maxPV]

    // let minX = 0, maxX = 3
    // let minY = 0, maxY = Math.max(...leftAxisData)

    //since there are only two lines
    // var Color = ['#00b7d4']
    // let legendColor = ['#00b7d4']
    // let legendText = ['PV Data']

    return (
      <View>
        {(profile.graphPvValue.length !== 0 && (!profile.isLoading))? 
            (
              <View style={styles.graphView}>
                <View style={styles.tabsView}>
                    <TouchableOpacity
                      style={(selectedValue === 'selfPv')?styles.selectedButton:styles.unselectedButton}
                      onPress={() => this.setData('selfPv')}
                    >
                      <Text style={(selectedValue === 'selfPv')?styles.selectedTabText:styles.unselectedTabText}>
                        {strings.graphPv.pvTypes.myPv}
                      </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.dataMonths}>
                  { bottomAxisDatatoShow[bottomAxisDatatoShow.length -1]}
                  {' '}
                  - 
                  {' '}
                  {bottomAxisDatatoShow[0]}
                </Text>
            <MultiLineChart
                chartHeight={chartViewHeight - 100}
                chartData={this.state.finalData}
                bottomAxisDatatoShow={bottomAxisDatatoShow}
              />
                {(profile.graphPvValue[0].overlay) ? (
                  <View 
                    style={styles.overlay} 
                    pointerEvents={(profile.graphPvValue[0].retry) ? 'auto' : 'none'}
                  > 
                    <TouchableOpacity 
                      style={styles.buttonView} 
                      onPress={() => profile.fetchUserPointHistory()}
                    >
                      <Text style={styles.errorMessage}>{profile.graphPvValue[0].message}</Text>
                    </TouchableOpacity>       
                  </View>
                  )
                  : null
                }
              </View>
            ): null
          }
      </View>
    )
  }

  render() {
    const {
      pvData
    } = this.state;
    const { profile } = this.props;
    return (
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />}
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.graphPv.screenTitle}
        />
        <ScrollView>
          <Loader loading={profile.isLoading} />
          {this.renderLineGraph()}
          <View style={{ paddingBottom:5 }}>
            <Text style={styles.listHeaderStyles}>{strings.graphPv.pvTypes.currentMonthPointDetails}</Text>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.previousCumulativePv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.prevCumPv)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.exclusivePV}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.exclPv)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.selfPv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.selfPv)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.groupPv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.groupPv)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.currentCumulativePv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.totalCumPv)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.totalPv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount((pvData.totalPv))}</Text>
            </View>
            {
              pvData.actualPv != '0' && (
                <View style={styles.lastMonthsDataContainer}>
                  <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.actualPv}</Text>
                  <Text style={styles.lastMonthValues}>{commaSeperateAmount((Number(pvData.actualPv).toFixed(2)))}</Text>
                </View>
              )
            }
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.nextLevel}</Text>
              <Text style={styles.lastMonthValues}>{pvData.nextLevel}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.shortPoints}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount((Number(pvData.shotPoint).toFixed(2)))}</Text>
            </View>
            <Text style={styles.listHeaderStyles}>{strings.graphPv.pvTypes.lastMonthPointDetails}</Text>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.previousExclusivePv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.previousExclPV)}</Text>
            </View>
            {/* <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.previousSelfPv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.previousSelfPv)}</Text>
            </View> */}
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.previousTotalPv}</Text>
              <Text style={styles.lastMonthValues}>{commaSeperateAmount(pvData.previousTotalPV)}</Text>
            </View>
            <View style={styles.lastMonthsDataContainer}>
              <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.lastMonthLevel}</Text>
              <Text style={styles.lastMonthValues}>{pvData.previousLevelName}</Text>
            </View>
            {
              pvData.previousActualPV && pvData.previousActualPV != '0' && (
                <View style={styles.lastMonthsDataContainer}>
                  <Text style={styles.lastMonthDetailTitles}>{strings.graphPv.pvTypes.previousActualPv}</Text>
                  <Text style={styles.lastMonthValues}>{commaSeperateAmount((Number(pvData.previousActualPV).toFixed(2)))}</Text>
                </View>
              )
            }
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default DownlinePvGraph;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#f0f3f7',
  },
  buttonView: {
    paddingHorizontal: 39,
    paddingVertical: 9,
    backgroundColor: '#ffc1c1'
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: viewHeight
  },
  errorMessage: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    ...Specs.fontMedium
  },
  graphView: {
    backgroundColor: '#ffffff',
    height: viewHeight,
  },
  tabsView:{
    flexDirection:'row',
    justifyContent:'space-around',
    marginHorizontal:10,
    marginTop:14
  },
  unselectedButton:{
    borderWidth:1,
    borderRadius:12.5,
    borderColor:'#979797',
    height:25,
    justifyContent:'center'
  },
  selectedButton:{
    borderRadius:12.5,
    backgroundColor:'#4a90e2',
    height:25,
    justifyContent:'center'
  },

  unselectedTabText:{
    marginHorizontal:17,
    color:'#373e73',
    fontSize:12,
    alignSelf:'center',
    ...Specs.fontMedium
  },
  selectedTabText:{
    marginHorizontal:17,
    color:'#ffffff',
    fontSize:14,
    alignSelf:'center',
    ...Specs.fontSemibold
  },
  dataMonths: {
    color: '#373e73',
    fontSize: 14,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 12,
    ...Specs.fontSemibold
  },
  lastMonthsDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 26,
    paddingBottom: 16,
    marginBottom: 2,
    paddingHorizontal: 16
  },
  listHeaderStyles: {
    ...Specs.fontSemibold,
    fontSize: 12,
    color: '#3f4967',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  lastMonthValues: {
    ...Specs.fontSemibold,
    color: '#31cab3',
    fontSize: 14,
  },
  lastMonthDetailTitles: {
    ...Specs.fontMedium,
    color: '#414456',
    fontSize: 14,
  }
});
