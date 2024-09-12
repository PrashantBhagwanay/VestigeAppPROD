import React, { Component, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SectionList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import autobind from 'autobind-decorator';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../components';
import { strings } from '../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../utility/Theme';
import styles from './style';
import Loader  from 'app/src/components/loader/Loader';

const ViewProspects = (props) => {

  const [prospectsUserList, setProspectsUserList] = useState([]);

  useEffect(()=>{
      fetchUserList()
  },[])

  const fetchUserList = async () => {
    const { trainingId } = props.route.params;
    const responseJSON = await props.training.fetchTrainingProspectsList(trainingId)
    if(responseJSON.success){
      if(responseJSON.hasOwnProperty('data') && responseJSON.data.length > 0){
        const sortedArray = []
        for(let _res of responseJSON?.data){
        let resObj = {}
        Object.keys(_res)
                .sort((a,b) => b.localeCompare(a))
                .forEach(function(v, i) {
                  resObj[v] = _res[v]
                 }); 
                 sortedArray.push(resObj)
               
        }
          setProspectsUserList(sortedArray);
      } else setProspectsUserList(responseJSON.data);
    
    }
  }

  const renderItem = (title, value) => {
    return (
      <View style={[styles.details, styles.detailView]}>
        <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>
          {title}
        </Text>
        <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
          {value}
        </Text>
      </View>
    );
  };

  const renderSectionListItem = (item, index) => {
    let _renderItem = [];
    for (const [key, value] of Object.entries(item)) {
      _renderItem.push(renderItem(key,value))
    }
    return <View style={[styles.listItemContainer, { marginHorizontal: 10}, index === 0 && { marginTop: 10}]}>{_renderItem}</View>
  }


  _renderTotalProspects = () => {
    return prospectsUserList.length > 0 && (
        <View style={styles.noOfProspects}>
          <Text style={styles.totalPropspectsCount}>{`${strings.trainingRequestScreen.totalProspects} ${prospectsUserList.length}`}</Text>
        </View>
      )
  }

  return (
    <SafeAreaView style={styles.container}>
    <Loader loading={props.training.isLoading} />
    <Header
      navigation={props.navigation}
      screenTitle={strings.trainingRequestScreen.viewProspects}
    />
    {/* {this._renderTotalProspects()} */}
    <FlatList
      data={prospectsUserList}
      keyExtractor={(item, index) => `${index}_${item?.key}`}
      renderItem={({ item, index }) =>
        renderSectionListItem(item, index)
      }
      // ListFooterComponent={() => this._renderTotalProspects()}
    />
    {
      prospectsUserList.length <= 0 && (
        <View style={styles.noProspectsFound}>
            <Text>{strings.trainingRequestScreen.noProspectsAttended}</Text>
        </View>
       
      )
    } 
    {this._renderTotalProspects()}
  </SafeAreaView>
  )
} 


export default inject('training')(observer(ViewProspects));
