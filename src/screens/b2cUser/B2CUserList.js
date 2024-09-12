import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { B2CUserListTypeEnum, UCDUserListTypeEnum } from '../../utility/constant/Constants';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import { Header } from '../../components';
import CardView from './component/CardView';
import { inject, observer } from 'mobx-react';



const B2CUserListTypeEnumData = [
  {
    title: B2CUserListTypeEnum.B2CJoinee,
  },
  {
    title: B2CUserListTypeEnum.B2CRequest,
  },
];


const UCDUserListTypeEnumData = [
  {
    title: UCDUserListTypeEnum.B2CJoinee,
  },
  
];

const B2CUserList =inject(
  'B2CFlow',
  'auth',
  'profile',
)(
  observer(props => {
    const {
      B2CFlow: {
        getUserB2cUserList,
        B2CUserList,
        setB2CMobileNoRequest,
        getPendingListForMyMobile,
        pendingListForMyMobile,
        setApproveRequestForMobileNo,
      },
      profile:{isDirectorId},
      auth: { distributorID,levelId,distributorType },
      navigation,
     
    } = props;
  const [selectedTab, setSelectedTab] = useState(B2CUserListTypeEnum.B2CJoinee);
  const [selectedTabB2C, setSelectedTabB2C] = useState(UCDUserListTypeEnum.B2CJoinee);
  
  // for ucd user
  useEffect( ()=>{
    if(selectedTab=== B2CUserListTypeEnum.B2CJoinee && isDirectorId == 1){
      dataForGetPendingList()
    }else if(selectedTab=== B2CUserListTypeEnum.B2CRequest && isDirectorId == 1){
      dataGetForB2CPending()
    }
   
  },[selectedTab])

 const dataForGetPendingList= async ()=>{
    await getUserB2cUserList(distributorID,2) 
  }

  // for normal user b2c
  useEffect( ()=>{
    if(selectedTabB2C=== UCDUserListTypeEnum.B2CRequest && isDirectorId !=1 ){
      dataGet()
    }else if( selectedTabB2C=== UCDUserListTypeEnum.B2CJoinee && isDirectorId !=1){
      dataForGetPendingListForBc2()
    }
   },[selectedTabB2C])


   const dataForGetPendingListForBc2= async ()=>{
    await getUserB2cUserList(distributorID,3) 
  }

  const dataGet=async ()=>{
   await getPendingListForMyMobile(distributorID,2)
  }

  const dataGetForB2CPending=async ()=>{
    await getPendingListForMyMobile(distributorID,1)
   }
 

  const onClickSendRequest=async (disId)=>{
    if(await setB2CMobileNoRequest(disId,isDirectorId==1?1:2,distributorID)){
      alert('Mobile Number Request Sent Successfully!')
      if(isDirectorId==1)
      await getUserB2cUserList(distributorID,2) 
      else
      await getUserB2cUserList(distributorID,3) 
    }
  }

  const onApproveClick=async (disId)=>{
    if(await setApproveRequestForMobileNo(disId,isDirectorId==1?1:2,distributorID)){
      alert('Mobile Number Request has been approved Successfully!')
      dataGetForB2CPending()
    }
  }

  


  return (
    <View>
      <Header navigation={navigation} screenTitle={isDirectorId==1?'B2C Joinee List':'Know your Leader'} />
     
         <>
      {isDirectorId==1 ?
      <>
       <CustomTopTab
        showTabDivider
        data={B2CUserListTypeEnumData}
        selectedValue={selectedTab}
        handleTabCallback={d => setSelectedTab(d)}
      />
      {selectedTab === B2CUserListTypeEnum.B2CJoinee && (
        <FlatList
          style={{ marginBottom: 120 }}
          data={B2CUserList}
          renderItem={({ item }) => (
            <CardView type={B2CUserListTypeEnum.B2CJoinee} itemData={item}  levelId ={isDirectorId}/>
          )}
        />
      )}

      {selectedTab === B2CUserListTypeEnum.B2CRequest && (
        <FlatList
          style={{ marginBottom: 120 }}
          data={pendingListForMyMobile}
          renderItem={({ item }) => (
            <CardView type={B2CUserListTypeEnum.B2CRequest} itemData={item}  levelId ={isDirectorId}  onApproveClick ={(disId)=>onApproveClick(disId) }/>
          )}
        />
      )}
      </>
      :
      <>
       <CustomTopTab
        showTabDivider
        data={UCDUserListTypeEnumData}
        selectedValue={selectedTabB2C}
        handleTabCallback={d => setSelectedTabB2C(d)}
      />
      {selectedTabB2C === UCDUserListTypeEnum.B2CJoinee && (
        <FlatList
          style={{ marginBottom: 120 }}
          data={B2CUserList}
          renderItem={({ item }) => (
            <CardView type={B2CUserListTypeEnum.B2CJoinee} itemData={item} onSendRequest={(disId)=>onClickSendRequest(disId)}   levelId ={isDirectorId}/>
          )}
        />
      )}

      {selectedTabB2C === UCDUserListTypeEnum.B2CRequest && (
        <FlatList
          style={{ marginBottom: 120 }}
          data={pendingListForMyMobile}
          renderItem={({ item }) => (
            <CardView type={B2CUserListTypeEnum.B2CRequest} itemData={item} onApproveClick ={(disId)=>onApproveClick(disId) }  levelId ={isDirectorId}/>
          )}
        />
      )}
      
      </>}
      </>
    </View>
    );
  }),
);

export default B2CUserList;
