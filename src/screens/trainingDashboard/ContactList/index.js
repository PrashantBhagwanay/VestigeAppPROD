import React, { Component, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  SectionList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import autobind from 'autobind-decorator';
import { Toast } from 'app/src/components/toast/Toast';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../components';
import { strings } from '../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../utility/Theme';
import styles from './style';
import Loader  from 'app/src/components/loader/Loader';
import ListItem from './component/ListItem';
import {
    checkAndroidPermission,
    PERMISSION_TYPES,
  } from '../../../utility/permissions/Permissions';
import Contact from 'react-native-contacts';
import HeaderSearchIcons from 'app/src/components/navigation/HeaderSearchIcons';


const ContactList = (props) => {

  const [contacts, setContacts] = useState([]);

  useEffect(()=>{
    requestContactsPermission()
  },[])

  const requestContactsPermission = async () => {
    console.log('ContactList',PERMISSION_TYPES.android.CONTACTS)
    const contactPermission = await checkAndroidPermission(
        PERMISSION_TYPES.android.CONTACTS,
        'Access Contacts',
        'Vestige needs access to your contacts',
      )
      console.log('contact List',contactPermission)
      if(contactPermission?.granted){
        loadContacts()
      }
  }
  

  const loadContacts = async () => {
    await Promise.all(Contact.getAllWithoutPhotos()
      .then(contacts => {
        console.log('Load Contacts >>>>>>>>>>>>',contacts)
        contacts.sort(
          (a, b) => 
          a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        const contactsList = contacts.map(v => ({...v, isActive: false}))
        setContacts(contactsList);
      })
      .catch(e => {
        alert('Permission to access contacts was denied');
        console.warn('Permission to access contacts was denied');
      }));
  };


  const showToast = (message: string, toastType: Toast.type) => {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  search = (text) => {
    const phoneNumberRegex = 
      /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    if (text === '' || text === null) {
      this.loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contact.getContactsByPhoneNumber(text).then(contacts => {
        contacts.sort(
          (a, b) => 
          a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
        console.log('contacts', contacts);
      });
    } else {
      Contact.getContactsMatchingString(text).then(contacts => {
        contacts.sort(
          (a, b) => 
          a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
        console.log('contacts', contacts);
      });
    }
  };

  const openContact = (contact) => {
    console.log(JSON.stringify(contact));
    // Contact.openExistingContact(contact);
  };

  const selectContact = (item,contact) => {
    const _contactList = JSON.parse(JSON.stringify(contacts))
    let isValid = null;
    _contactList.forEach(element => {

     // alert(JSON.stringify(element.displayName, element.phoneNumbers, element.phoneNumbers.length))
      if(element.displayName && element.phoneNumbers && element.phoneNumbers.length > 0){
        if(element.displayName === contact.displayName && element.phoneNumbers[0].number === contact.phoneNumbers[0].number){
          element.isActive = item
          isValid = true;
        }
        else {
          isValid = false
        }
      }
    });
    if(!isValid){
      showToast('Invalid Contact',Toast.type.ERROR)
    }
    setContacts(_contactList)
    console.log('Selcte Contact>>>>>>>>>>',_contactList)
    // setContacts(updatedContacts)
   
  }

  return (
    <SafeAreaView style={styles.container}>
    <Loader loading={props.training.isLoading} />
    <Header
      navigation={props.navigation}
      screenTitle={strings.trainingRequestScreen.contactList}
    />
  {/* <TextInput
    onChangeText={search}
    placeholder="Search"
    style={styles.searchBar}
  /> */}
      {/* <TextInput
          style={styles.textInputStyle}
          onChangeText={(text) => search(text)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="Search Here"
        /> */}
  <FlatList
    data={contacts}
    renderItem={(contact) => {
      // {
      //   console.log('contact -> ' + JSON.stringify(contact));
      // }
      return (
        <ListItem
          key={contact.item.recordID}
          item={contact.item}
          selectItem={selectContact}
          onPress={openContact}
        />
      );
    }}
    keyExtractor={(item) => item.recordID}
  />
  </SafeAreaView>
  )
} 


export default inject('training')(observer(ContactList));

