import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CustomButton } from 'app/src/components/buttons/Button';
const FEEDBACKICON = require('app/src/assets/images/feedbackIcon.png');
const STAR_UNFILL = require('app/src/assets/images/grey_star.png');
const STAR_FILL = require('app/src/assets/images/coloured_Star.png');

@inject('network','profile', 'auth')
@observer
export default class MyNetworkComponent extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = () => {
    const { item } = this.props;
    let distId = '123'
    if (item && item.distributorId != null) {
      distId = item.distributorId;
    }
    const { navigation } = this.props;
    navigation.navigate('myNetwork', { userDistributedId: distId }); // userDistributedId for testing
  }

  showArrowIcon = (item) => {
    if (this.props.network.expandCell === item.distributorId) {
      return (
        <Icon
          name='arrow-up'
          type='simple-line-icon'
          color='black'
          size={16}
        />
      )
    }
    return (
      <Icon
        name='arrow-down'
        type='simple-line-icon'
        color='black'
        size={16}
      />
    )
  }

  getPercentageChange = (percentageChange)=>{
    if(percentageChange === 'Infinity') return 100
    else if(percentageChange <= 100) return percentageChange.toFixed(2)
    else return 100
  }

  renderDataTable = (data) => {
    const { date2PV = 0, date1PV = 0, percentageChange = 0 ,
       date1APV = 0, date2APV = 0, percentageChangeAPV = 0} = data

    const differance = date2PV - date1PV
    const color = differance <= 0 ? 'red' : 'green'


    const differanceAPV = date2PV - date1PV
    const colorAPV = differanceAPV <= 0 ? 'red' : 'green'

    return (
      <View style={{ flex: 1, marginTop: 5 }}>
        <View style={styles.tabsView}>
          {
            ['Attribute', 'From Date TPV', 'To Date TPV'].map((tableColumn, index) => {
              return (
                <View
                  style={styles.headingContainer}
                  key={tableColumn}
                >
                  <Text
                    style={{ fontWeight: 'bold', fontSize: 12.5, textAlign: index === 0 ? 'left' : 'center', }}
                  >
                    {tableColumn}
                  </Text>
                </View>
              )
            })
          }
        </View>
        <View style={{ flex: 1, }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', }}
          >
            <View style={styles.attributeContiner}>
              <Text style={{ flex: 1, fontSize: 12 }}>TPV</Text>
              <View style={styles.differance}>
                <Text style={{ marginHorizontal: 10, fontSize: 12, color: color }}>
                  {this.getPercentageChange(percentageChange)}
                  %
                </Text>
                <FontAwesome
                  name={differance <= 0 ? 'caret-down' : 'caret-up'}
                  size={25}
                  color={color}
                />
              </View>
            </View>
            <Text style={styles.tableData}>{date1PV}</Text>
            <Text style={styles.tableData}>{date2PV}</Text>
          </View>
        </View>

        <View style={styles.tabsView}>
          {
            ['Attribute', 'From Date APV', 'To Date APV'].map((tableColumn, index) => {
              return (
                <View
                  style={styles.headingContainer}
                  key={tableColumn}
                >
                  <Text
                    style={{ fontWeight: 'bold', fontSize: 12.5, textAlign: index === 0 ? 'left' : 'center', }}
                  >
                    {tableColumn}
                  </Text>
                </View>
              )
            })
          }
        </View>

        <View style={{ flex: 1, }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', }}
          >
            <View style={styles.attributeContiner}>
              <Text style={{ flex: 1, fontSize: 12 }}>APV</Text>
              <View style={styles.differance}>
                <Text style={{ marginHorizontal: 10, fontSize: 12, color: colorAPV }}>
                  {this.getPercentageChange(percentageChangeAPV)}
                  %
                </Text>
                <FontAwesome
                  name={differanceAPV <= 0 ? 'caret-down' : 'caret-up'}
                  size={25}
                  color={colorAPV}
                />
              </View>
            </View>
            <Text style={styles.tableData}>{date1APV}</Text>
            <Text style={styles.tableData}>{date2APV}</Text>
          </View>
        </View>
      </View>
    )
  }

  detailButton = () => {
    const { item, goToDetailPage } = this.props
    return (
      <CustomButton
        buttonContainer={styles.button}
        handleClick={() => {
          goToDetailPage(item)
        }}
        linearGradient
        buttonTitle={strings.MyNetworkComponent.detailsButtonTittle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
        buttonTitleStyle={styles.customButtonTitleStyle}
      />
    )
  }

  getDescriptionView = (item) => {
    const { selectedTab } = this.props;
    if (this.props.network.expandCell === item.distributorId) {
      return (
        <View style={{ paddingTop: 15 }}>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.Designation}</Text>
            <Text style={styles.text}>{item.designation}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.previousPv}</Text>
            <Text style={styles.text}>{item.prevCumPv ? Number(item.prevCumPv).toFixed(2) : '0'}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.exclusivePv}</Text>
            <Text style={styles.text}>{item.exclPv ? Number(item.exclPv).toFixed(2) : '0'}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.selfPv}</Text>
            <Text style={styles.text}>{item.selfPv ? Number(item.selfPv).toFixed(2) : '0'}</Text>
          </View>
          {Number(item.shotPoint) ? (
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>{strings.myNetworkScreen.shotPoint}</Text>
              <Text style={styles.text}>{item.shotPoint ? Number(item.shotPoint).toFixed(2) : '0'}</Text>
            </View>
          )
            : null}
          {Number(item.nextLevel) ? (
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>{strings.myNetworkScreen.nextLevel}</Text>
              <Text style={styles.text}>{item.nextLevel ? Number(item.nextLevel).toFixed(2) : '0'}</Text>
            </View>
          )
            : null}
          {Number(item.vbdPV) ? (
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>{strings.myNetworkScreen.vbdPV}</Text>
              <Text style={styles.text}>{item.vbdPV ? Number(item.vbdPV).toFixed(2) : '0'}</Text>
            </View>
          )
            : null}
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.groupPv}</Text>
            <Text style={styles.text}>{item.groupPv ? Number(item.groupPv).toFixed(2) : '0'}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.totalPv}</Text>
            <Text style={styles.text}>{item.totalCumPv ? Number(item.totalCumPv).toFixed(2) : '0'}</Text>
          </View>
          {
            Math.round(item.actualPv) != '0' && (
              <View style={styles.networkDistributorDetails}>
                <Text style={styles.textHeading}>{strings.myNetworkScreen.actualPv}</Text>
                <Text style={styles.text}>{Number(item.actualPv).toFixed(2)}</Text>
              </View>
            )
          }
          {
            item.actualExclPV && Math.round(item.actualExclPV) != '0' && (
              <View style={styles.networkDistributorDetails}>
                <Text style={styles.textHeading}>{strings.myNetworkScreen.actualExclPV}</Text>
                <Text style={styles.text}>{Number(item.actualExclPV).toFixed(2)}</Text>
              </View>
            )
          }
          <Text style={[styles.idText, { marginVertical: 5, fontSize: 16 }]}>Last Month Point Details</Text>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.previousExclusivePv}</Text>
            <Text style={styles.text}>{item.previousExclPV ? Number(item.previousExclPV).toFixed(2) : '0'}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.previousTotalPv}</Text>
            <Text style={styles.text}>{item.previousTotalPV ? Number(item.previousTotalPV).toFixed(2) : '0'}</Text>
          </View>
          <View style={styles.networkDistributorDetails}>
            <Text style={styles.textHeading}>{strings.myNetworkScreen.previousLevel}</Text>
            <Text style={styles.text}>{item.previousLevelName ? item.previousLevelName : '0'}</Text>
          </View>
          {
            Math.round(item.previousActualPV) != '0' && (
              <View style={styles.networkDistributorDetails}>
                <Text style={styles.textHeading}>{strings.myNetworkScreen.previousActualPv}</Text>
                <Text style={styles.text}>{item.previousActualPV ? Number(item.previousActualPV).toFixed(2) : '0'}</Text>
              </View>
            )
          }
          {
            item.prevActualExclPV && Math.round(item.prevActualExclPV) != '0' && (
              <View style={styles.networkDistributorDetails}>
                <Text style={styles.textHeading}>{strings.myNetworkScreen.prevActualExclPV}</Text>
                <Text style={styles.text}>{item.previousActualPV ? Number(item.prevActualExclPV).toFixed(2) : '0'}</Text>
              </View>
            )
          }
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ flex: 0.9, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
              {selectedTab === 'starred' && this.detailButton()}
            </View>
            <View style={{ flex: 0.1, justifyContent: 'center', paddingVertical: 10, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { this.props.navigation.navigate('distributorFeedback', { data: item }) }}>
                <Image resizeMode='contain' style={{ marginTop: 15, marginBottom: 10 }} source={FEEDBACKICON} />
              </TouchableOpacity>
            </View>
          </View>
          {
            (!Number(item.isDafUploaded) && this.props.profile.countryId !=2 ) ? (
              <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 4}}>
                <Text style={{ color: 'red' }}>{strings.myNetworkScreen.dafNotSubmitted}</Text>
              </View>
            ) : null
          }
          <View style={styles.footerLabels}>
            <Text
              style={[styles.descriptionFooterText, { paddingRight: 10 }]}
              onPress={() => { this.props.fetchMainUplineData() }}
            >
              {strings.myNetworkScreen.mainUpline}
            </Text>
            <Text
              style={[styles.descriptionFooterText, { paddingHorizontal: 15 }]}
              onPress={() => { this.props.fetchCellUplineData(item) }}
            >
              {strings.myNetworkScreen.upline}
            </Text>
            <Text
              style={[styles.descriptionFooterText, { paddingLeft: 10 }]}
              onPress={() => { this.props.fetchDownlineData(item) }}
            >
              {strings.myNetworkScreen.downline}
            </Text>
          </View>
        </View>
      )
    }
    else {
      return (
        null
      )
    }
  }

  handleArrowIcon = async (item) => {
    if (item.distributorId && this.props.network.expandCell !== item.distributorId) {
      // if(this.props.selectedTab != 'myNetwork' && item.distributorId == this.props.auth.distributorID){
      //   await this.props.network.updateStarredDownlineData(item.distributorId);
      //   this.props.updateAsyncValue();
      // }
      this.props.network.setExpandCell(item.distributorId);
    }
    else {
      this.props.network.setExpandCell('')
    }
  }

  getDistributorNameColour = (item) => {
    if (item.isApplicable == 0) return { color: '#005aab' }
    if (item.isApplicable == 2) return { color: '#fe8600' }
    if (item.isApplicable == 3) return { color: '#f6ff08' }
    if (item.isApplicable == 1) return { color: '#848484' }
  }

  renderConsistencyInfo = (item) => {
    return(
      <View style={{ flex: 1, marginTop: 5 }}>
        <View style={styles.networkDistributorDetails}>
          <Text style={[styles.text, {flex:1}]}>{strings.myNetworkScreen.consistencyStatus}</Text>
          <Text style={[styles.text, {flex:1, textAlign:'right'}]}>{item.consistencyCountDue || 'NA'}</Text>
        </View>
        {(item.distributorId !== this.props.auth.distributorID && 
          (item?.smsCount > 0 || item?.alertCount > 0 || item?.notificationCount > 0 )) 
          ? 
          (
            <View style={{flexDirection:'row-reverse'}}>
              <TouchableOpacity
                style={styles.notifyConsistencyButton}
                onPress={() => this.props.handleConsistencyNotification(item)}
              >
                <Text style={[styles.text, {color:'#4a90e2', textDecorationLine:'underline'}]}>{strings.myNetworkScreen.sendConsistencyReminder}</Text>
              </TouchableOpacity>
            </View>
          )
          : null
        }
      </View>
    )
  }

  renderSchemeText = (item) => {
    if(item.specialSchemeText != '' && item.specialSchemeColor != ''){
      return(
        <View style={{ flex: 1, marginTop: 5 }}>
          <View style={styles.networkDistributorDetails}>
            <Text style={[styles.text, {color: item.specialSchemeColor}]}>{item.specialSchemeText}</Text>
            {/* <Text style={[styles.text]}>{item.consistencyCountDue || 'NA'}</Text> */}
          </View>
        </View>
      )
    }
  }

  renderSchemeText = (item) => {
    if(item.specialSchemeText != '' && item.specialSchemeColor != ''){
      return(
        <View style={{ flex: 1, marginTop: 5 }}>
          <View style={styles.networkDistributorDetails}>
            <Text style={[styles.text, {color: item.specialSchemeColor}]}>{item.specialSchemeText}</Text>
            {/* <Text style={[styles.text]}>{item.consistencyCountDue || 'NA'}</Text> */}
          </View>
        </View>
      )
    }
  }

  render() {
    // const { showDescription }  = this.state;
    const { item, index, isFavorite, onStarPress, selectedTab } = this.props;

    let name = 'Peter Martin';
    let id = 'ID: 981078920182';
    let pvValue = '800Pts';
    let bonusPercent = '750Pts';
    //console.log('resitemmynetwork ',JSON.stringify(item))
    if (item && item.distributorName != null) {
      name = item.distributorName;
    }
    if (item && item.distributorId != null) {
      id = 'ID: ' + item.distributorId;
    }
    if (item && item.totalPv != null) {
      pvValue = item.totalPv;
    }
    if (item && item.totalCumPv != null) {
      bonusPercent = item.bonusPercent + '%';
    }

    return (
      <View style={styles.mainView}>
        <View style={styles.verticalLine} />
        <View style={styles.horizontalLine} />
        <View style={[styles.textView, styles.cellView, { ...(!Number(item.totalPv) && { backgroundColor: '#D3D3D3' }) }]}>
          <View style={styles.titleView}>
            {/* <Text style={[styles.nameText, {color: item.colourCode}]} numberOfLines={2}> */}
            <View style={[styles.subTitleView, { ...({ flex: 0.55}) }]}>
              <Text
                numberOfLines={2}
                style={[styles.nameText, { ...((item.colourCode) && { color: item.colourCode }) }]}
              >
                {name}
              </Text>
              <Text style={styles.pvText}>
                {strings.myNetworkScreen.pointValue}
                <Text style={styles.pvValueText}>
                  {'  ' + pvValue}
                </Text>
              </Text>
            </View>
            <View style={[styles.subTitleView, { ...({ flex: 0.35 }) }]}>
              <View>
                <Text style={styles.idText}>
                  {id}
                </Text>
                <Text style={styles.pvTargetValueText}>
                  {bonusPercent}
                </Text>
              </View>
            </View>
            <View style={[styles.starIconView, { flex: 0.1 }]}>
              <TouchableOpacity
                onPress={() => { onStarPress(isFavorite, item) }}
              >
                <Image
                  style={{ height: 25, width: 25 }}
                  source={isFavorite ? STAR_FILL : STAR_UNFILL}
                />
              </TouchableOpacity>
            </View>
          </View>
          {item?.isConsistencySkipped === '0' && this.renderConsistencyInfo(item)}
          {item?.specialSchemeText ? this.renderSchemeText(item) : null}
          {selectedTab === 'starred' && this.renderDataTable(item)}
          {this.getDescriptionView(item)}
        </View>
        <TouchableOpacity
          onPress={() => { this.handleArrowIcon(item) }}
          style={styles.accordionArrow}
        >
          {this.showArrowIcon(item)}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#e8ebf0',
    flexDirection: 'column',
    flex: 1
  },
  verticalLine: {
    backgroundColor: '#c8c8c8',
    height: '100%',
    width: 1,
    marginLeft: 15,
    position: 'absolute',
  },
  horizontalLine: {
    height: 1,
    width: 60,
    marginLeft: 15,
    zIndex: -1,
    borderTopColor: '#c8c8c8',
    borderTopWidth: 1,
    position: 'absolute',
    top: 50
  },
  cellView: {
    zIndex: -1,
    paddingBottom: 22,
    paddingTop: 5,
    paddingHorizontal: 15,
    marginLeft: 33,
    marginRight: 17,
    marginTop: 8,
    borderRadius: 3,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  textView: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    marginTop: 11,
    backgroundColor: '#fff'
  },
  titleView: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
  },
  subTitleView: {
    marginTop: 5,
    // alignItems: 'flex-start',
    paddingRight: 10,
  },
  nameText: {
    ...Specs.fontBold,
    fontSize: 14,
    color: '#848484',
  },
  pvText: {
    color: '#404652',
    ...Specs.fontSemiBold,
    fontSize: 14
  },
  pvValueText: {
    color: '#31cab3',
    marginLeft: 15,
    paddingLeft: 10,
    fontSize: 14
  },
  starIconView: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 5,
    paddingLeft: 5
  },
  idText: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#515867',
  },
  pvTargetValueText: {
    color: '#f5a623',
    marginLeft: 5,
    ...Specs.fontMedium,
    fontSize: 14,
  },
  tabsView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attributeContiner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  differance: {
    flexDirection: 'row',
    flex: 3,
    alignItems: 'center'
  },
  headingContainer: {
    flex: 1,
    paddingVertical: 2,
  },
  tableData: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12
  },
  accordionArrow: {
    elevation: 3,
    // flexDirection:'row'?,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    top: -15,
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 50
  },
  descriptionFooterText: {
    ...Specs.fontRegular,
    borderBottomColor: '#515867',
    textDecorationLine: 'underline',
    color: '#515867',
    fontSize: 14,
    paddingVertical: 8
  },
  networkDistributorDetails: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  footerLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textHeading: {
    ...Specs.fontRegular,
    fontSize: 14,
    color: '#6c7a87',

  },
  text: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#6c7a87',
  },
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 10,
    width: 150,
    height: 40,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  notifyConsistencyButton : {
    height:25, 
    minWidth:155,
    // width: 150,
    // backgroundColor: 'yellow', 
    // paddingVertical: 2, 
    alignItems: 'flex-end',
    // paddingHorizontal: 10,
    // borderRadius:10,
    // elevation:3,
    // shadowOffset: { width: 0, height: 0 },
    // shadowColor: '#808080',
    // shadowOpacity: 0.5,
    // shadowRadius: 3,
  },
});
