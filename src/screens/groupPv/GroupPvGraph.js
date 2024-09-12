//@flow

import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  ScrollView,
} from 'react-native';
import MultiLineChart from '../../components/chartComponent/MultiLineChart';
import { Specs, COLOR_CODES } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react';
import Loader from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import {
  commaSeperateAmount,
  connectedToInternet,
  valueFormatter,
} from 'app/src/utility/Utility';
import { observable, makeObservable } from 'mobx';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';
// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const deviceWidth = Dimensions.get('window').width * 0.91;
const deviceHeight = Dimensions.get('window').height * 0.3;
const chartViewHeight = Dimensions.get('window').height * 0.52;


@inject('profile', 'auth')
@observer
class GroupPvGraph extends Component {
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.distributorID = this.props.auth.distributorID;
    this.state = {
      // completeData: [],
      finalData: [0],
      leftAxisData: [0],
      bottomAxisData: [],
      minX: '',
      minY: 0,
      maxX: '',
      maxY: '',
      bottomAxisDatatoShow: [],
      selectedValue: '',
      leftAxisDataToShow: [],
    };
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && (await this.getComponentData());
  }

  @autobind
  async getComponentData() {
    const { profile, navigation, route } = this.props;
    await this.props.profile.fetchUserPointHistory(this.distributorID);
    const length = profile.graphPvValue;
    console.log('reslength', length);
    if (profile.graphPvValue.length > 0) {
      await this.setData(route.params.type);
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  }

  setData(type) {
    const { profile } = this.props;
    // this.state.completeData = [];
    (this.state.leftAxisData = [0]),
      (this.state.bottomAxisData = []),
      (this.state.minX = ''),
      (this.state.minY = 0),
      (this.state.maxX = ''),
      (this.state.maxY = ''),
      (this.state.bottomAxisDatatoShow = []),
      (this.state.leftAxisDataToShow = [0]);
    var {
      bottomAxisData,
      // completeData,
      leftAxisData,
      bottomAxisDatatoShow,
      leftAxisDataToShow,
    } = this.state;
    var minValueArray = [];
    var demoData = [];
    profile.graphPvValue?.map((userData, index) => {
      // demoData.push({
      //   y: userData[type],
      //   x: index,
      // });
      demoData?.push(JSON.parse(userData[type]));
      this.setState({ finalData: demoData });
      minValueArray.push(userData[type]);
      bottomAxisData.push(index);
      bottomAxisDatatoShow.push(userData.bussinessMonth);
    });
    // completeData.push(demoData);
    if (Math.max(...minValueArray) < 6) {
      var slab = 1;
    } else {
      slab = Math.round(Math.max(...minValueArray) / 6);
    }
    for (let i = 0; i <= 6; i++) {
      leftAxisData.push(Math.max(...leftAxisData) + slab);
      leftAxisDataToShow.push(valueFormatter(Math.max(...leftAxisData) + slab));
    }
    this.state.minX = Math.min(...bottomAxisData);
    this.state.maxX = Math.max(...bottomAxisData);
    this.state.maxY = Math.max(...leftAxisData);
    this.setState({
      selectedValue: type,
    });
  }

  detailsView = (title, value, index) => {
    return (
      <View key={index.toString()} style={styles.lastMonthsDataContainer}>
        <Text style={styles.lastMonthDetailTitles}>{title || '0'}</Text>
        <Text style={styles.lastMonthValues}>{value || '0'}</Text>
      </View>
    );
  };

  tabsView = selectedValue => {
    return (
      <View style={styles.tabsView}>
        <TouchableOpacity
          style={
            selectedValue === 'selfPv'
              ? styles.selectedButton
              : styles.unselectedButton
          }
          onPress={() => this.setData('selfPv')}>
          <Text
            style={
              selectedValue === 'selfPv'
                ? styles.selectedTabText
                : styles.unselectedTabText
            }>
            {strings.graphPv.pvTypes.myPv}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            selectedValue === 'groupPv'
              ? styles.selectedButton
              : styles.unselectedButton
          }
          onPress={() => this.setData('groupPv')}>
          <Text
            style={
              selectedValue === 'groupPv'
                ? styles.selectedTabText
                : styles.unselectedTabText
            }>
            {strings.graphPv.pvTypes.groupPv}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            selectedValue === 'totalPv'
              ? styles.selectedButton
              : styles.unselectedButton
          }
          onPress={() => this.setData('totalPv')}>
          <Text
            style={
              selectedValue === 'totalPv'
                ? styles.selectedTabText
                : styles.unselectedTabText
            }>
            {strings.graphPv.pvTypes.totalPv}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  otherDetailsSection = () => {
    const { profile } = this.props;
    return (
      <View style={{ MarginVertical: 10 }}>
        <View>
          {profile.graphPvValue?.length ? (
            <Text style={styles.listHeaderStyles}>
              {strings.graphPv.pvTypes.monthlyActualPv}
            </Text>
          ) : null}
          {profile.graphPvValue.map((userData, index) => {
            return this.detailsView(
              userData.bussinessMonth, 
              userData.actualPv, 
              index);
          })}
        </View>
        <Text style={styles.listHeaderStyles}>
          {strings.graphPv.pvTypes.currentMonthPointDetails}
        </Text>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.previousCumulativePv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.previousCumuLativePointValue)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.exclusivePV}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.exclusivePointValue)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.selfPv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.selfPointValue)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.groupPv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.groupPointValue)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.currentCumulativePv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.currentCumulativePointValue)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.totalPv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.totalPointValue)}
          </Text>
        </View>
        {profile.actualPv != '0' ? (
          <View style={styles.lastMonthsDataContainer}>
            <Text style={styles.lastMonthDetailTitles}>
              {strings.graphPv.pvTypes.actualPv}
            </Text>
            <Text style={styles.lastMonthValues}>
              {commaSeperateAmount(Number(profile.actualPv).toFixed(2))}
            </Text>
          </View>
        ) : null}
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.nextLevel}
          </Text>
          <Text style={styles.lastMonthValues}>{profile.nextLevel}</Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.shortPoints}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(Number(profile.shortPoint).toFixed(2))}
          </Text>
        </View>
        <Text style={styles.listHeaderStyles}>
          {strings.graphPv.pvTypes.lastMonthPointDetails}
        </Text>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.previousExclusivePv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.previousExclusivePv)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.previousSelfPv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.previousSelfPv)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.previousTotalPv}
          </Text>
          <Text style={styles.lastMonthValues}>
            {commaSeperateAmount(profile.previousTotalPv)}
          </Text>
        </View>
        <View style={styles.lastMonthsDataContainer}>
          <Text style={styles.lastMonthDetailTitles}>
            {strings.graphPv.pvTypes.lastMonthLevel}
          </Text>
          <Text style={styles.lastMonthValues}>
            {profile.previousMonthLevel}
          </Text>
        </View>
        {profile.previousActualPv && profile.previousActualPv != '0' ? (
          <View style={styles.lastMonthsDataContainer}>
            <Text style={styles.lastMonthDetailTitles}>
              {strings.graphPv.pvTypes.previousActualPv}
            </Text>
            <Text style={styles.lastMonthValues}>
              {commaSeperateAmount(Number(profile.previousActualPv).toFixed(2))}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  render() {
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
      leftAxisDataToShow,
    } = this.state;
    const { profile } = this.props;
    return (
      <View style={styles.mainView}>
        {!this.isInternetConnected && (
          <OfflineNotice networkStatus={status => this.networkStatus(status)} />
        )}
        <Loader loading={profile.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.graphPv.screenTitle}
        />
        <ScrollView>
          {profile.graphPvValue?.length !== 0 && !profile.isLoading ? (
            <View style={styles.graphView}>
              {this.tabsView(selectedValue)}
              <Text style={styles.dataMonths}>
                {`From : `}
                {bottomAxisDatatoShow[0]}
                {'    '}
                {`To : `}
                {bottomAxisDatatoShow[bottomAxisDatatoShow.length - 1]}
              </Text>
              {/* <MultiLineChart
                data={completeData}
                leftAxisData={leftAxisData}
                bottomAxisData={bottomAxisData}
                leftAxisDataToShow={leftAxisDataToShow}
                bottomAxisDataToShow={bottomAxisDatatoShow}
                hideXAxisLabels={false}
                minX={minX}
                maxX={maxX}
                minY={minY}
                maxY={maxY}
                Color={Color}
                yAxisGrid
                showTicks
                hideXAxis
                hideYAxis
                chartHeight={deviceHeight}
                chartWidth={deviceWidth}
                inclindTick={false}
                axisLabelColor="#567bc7"
                tickColorXAxis="#ffffff"
                tickColorYAxis="#9b9b9b"
                fillArea
                pointDataToShowOnGraph=""
              /> */}
              <MultiLineChart
                chartHeight={chartViewHeight - 100}
                chartData={this.state.finalData}
                bottomAxisDatatoShow={bottomAxisDatatoShow}
              />
              {profile.graphPvValue[0].overlay ? (
                <View
                  style={styles.overlay}
                  pointerEvents={
                    profile.graphPvValue[0].retry ? 'auto' : 'none'
                  }>
                  <TouchableOpacity
                    style={styles.buttonView}
                    onPress={() =>
                      profile.fetchUserPointHistory(this.distributorID)
                    }>
                    <Text style={styles.errorMessage}>
                      {profile.graphPvValue[0].message}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}
          {this.otherDetailsSection()}
        </ScrollView>
      </View>
    );
  }
}

export default GroupPvGraph;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#f0f3f7',
  },
  buttonView: {
    paddingHorizontal: 39,
    paddingVertical: 9,
    backgroundColor: '#ffc1c1',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: chartViewHeight,
  },
  errorMessage: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    ...Specs.fontMedium,
  },
  graphView: {
    backgroundColor: '#ffffff',
    height: chartViewHeight,
  },
  unselectedTabText: {
    marginHorizontal: 17,
    color: '#373e73',
    fontSize: 12,
    alignSelf: 'center',
    ...Specs.fontMedium,
  },
  selectedTabText: {
    marginHorizontal: 17,
    color: '#ffffff',
    fontSize: 14,
    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
  unselectedButton: {
    borderWidth: 1,
    borderRadius: 12.5,
    borderColor: '#979797',
    height: 25,
    justifyContent: 'center',
  },
  selectedButton: {
    borderRadius: 12.5,
    backgroundColor: COLOR_CODES.defaultBlue,
    height: 25,
    justifyContent: 'center',
  },
  tabsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginTop: 14,
  },
  dataMonths: {
    color: '#373e73',
    fontSize: 14,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 12,
    ...Specs.fontSemibold,
  },
  lastMonthsDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 12,
    marginBottom: 2,
    paddingHorizontal: 16,
  },
  listHeaderStyles: {
    ...Specs.fontSemibold,
    fontSize: 12,
    color: '#3f4967',
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  },
});
