import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLOR_CODES, Specs } from '../../utility/Theme';
import { useNavigation } from '@react-navigation/native';
const CUSTOMER_IMAGE = require('app/src/assets/images/b2c/customer.jpg');
const DISTRIBUTOR_IMAGE = require('app/src/assets/images/b2c/distributor.jpg');

import { inject, observer } from 'mobx-react';

const BenifitB2BModal = inject(
  'auth',
  'profile',
)(
  observer(props => {
    const {
      auth: { distributorID, levelId, distributorType },
      profile: { directorDistributorName },
      isB2BModalShow,
      setModalVisibleB2B,
    } = props;
    const navigation = useNavigation();
    //   const [modalVisible, setModalVisible] = useState(true);

    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isB2BModalShow}
          onRequestClose={() => setModalVisibleB2B(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>
                  Become A B2B Distributor with Vestige
                </Text>

                <View style={styles.mainSubContainer}>
                  <Text style={styles.subtitle}>
                    Start as a B2B Distributor
                  </Text>

                  <Image
                    resizeMode="cover"
                    style={{ height: 100, width: '100%' }}
                    source={DISTRIBUTOR_IMAGE}
                  />

                  <Text style={[styles.text,{color:'blue'}]}>
                    <Text style={styles.subHeadingText}>
                      · Transition Process:{` `}
                    </Text>
                    Interested users must undergo KYC process as per the norms.
                    This validates their credential for business transaction.
                    This transition is supported by detailed guidance from
                    Vestige and the ongoing support of an assigned distributor.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Flexible Purchasing:{` `}
                    </Text>
                    Purchase products at a discount for personal use and earn
                    rewards.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Additional Earnings:{` `}
                    </Text>
                    Benefit from significant discounts based on sales volume,
                    with excellent potential for growth.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Business Development:{` `}
                    </Text>
                    Receive comprehensive tools and training to expand your
                    Vestige business.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · B2B Dynamics Dashboard:{` `}
                    </Text>
                    Access a dashboard with interactive features to manage and
                    analyze your business performance
                  </Text>


                  
                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · PV Accumulation on Each Purchase:{` `}
                    </Text>
                    B2B distributor benefit from the accumulation of PVs on every purchase they make. This accumulation contributes towards higher levels of rewards and incentives.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Get Started:{` `}
                    </Text>
                    Discover strategies for success in our Achiever Success
                    Story or check out the tutorial videos online.
                  </Text>
                  

                  <View style={{ flexDirection: 'row', alignSelf: 'center',marginBottom:10 }}>
                <TouchableOpacity
                  style={[styles.buttonStyle, { backgroundColor: '#58cdb4' }]}
                  onPress={() => {
                    var name =
                      directorDistributorName == null
                        ? ''
                        : directorDistributorName;

                    if (
                      distributorType == 3 &&
                      (directorDistributorName == 'HO' || name == '')
                    ) {
                      Alert.alert(
                        ' ',
                        'Thank you for your interest in becoming a B2B user. You will be notified for the next step very soon.',
                        [
                          { 
                            text: 'OK',
                            onPress: () => {console.log('OK Pressed')
                            setModalVisibleB2B(false);
                          },
                          },
                        ],
                        { cancelable: false },
                      );
                    } else {
                      setModalVisibleB2B(false);
                      navigation.navigate('kycImage', { isLoginRoute: true });
                    }
                  }}>
                  <Text style={styles.styleSubmit}>Proceed</Text>
                </TouchableOpacity>
              </View>
                  {/* <TouchableOpacity>
                 <Text style={styles.videoLinkStyle}>{'Watch the Signup Video Tutorial'}</Text>
                </TouchableOpacity> */}
                </View>
                <Text style={styles.orSubtitle}>OR</Text>

                <View style={styles.mainSubContainer}>
                  <Image
                    resizeMode="cover"
                    style={{ height: 100, width: '100%' }}
                    source={CUSTOMER_IMAGE}
                  />

                  <Text style={styles.subtitle}>
                    You as a B2C Distributor
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Exclusive Discounts:{` `}
                    </Text>
                    Enjoy discounts on all Vestige products.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Member Support:{` `}
                    </Text>
                    Gain access to new product previews and exclusive
                    member-only promotions.
                  </Text>

                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · Learn More:{` `}
                    </Text>
                    Explore the benefits in our B2C distributor Guide or watch our
                    tutorial videos.
                  </Text>
                  <Text style={styles.text}>
                    <Text style={styles.subHeadingText}>
                      · No PV Accumulation:{` `}
                    </Text>
                    B2C  distributor do not accumulate PVs with their purchases. You as B2C distributor buy products for personal use, but do not receive the PV-based benefits linked to the accumulation of these points.
                  </Text>
              

                  {/* <TouchableOpacity>
                 <Text style={styles.videoLinkStyle}>{'Watch the Signup Video Tutorial'}</Text>
                </TouchableOpacity>
              */}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                {/* <TouchableOpacity
                  style={[styles.buttonStyle, { backgroundColor: '#58cdb4' }]}
                  onPress={() => {
                    var name =
                      directorDistributorName == null
                        ? ''
                        : directorDistributorName;

                    if (
                      distributorType == 3 &&
                      (directorDistributorName == 'HO' || name == '')
                    ) {
                      Alert.alert(
                        ' ',
                        'Thank you for your interest in becoming a B2B user. Please note that your account is eligible to become a B2B user by next day 08:00 AM of your initial signup as a B2C user. Check back tomorrow. We appreciate your patience!',
                        [
                          { 
                            text: 'OK',
                            onPress: () => {console.log('OK Pressed')
                            setModalVisibleB2B(false);
                          },
                          },
                        ],
                        { cancelable: false },
                      );
                    } else {
                      setModalVisibleB2B(false);
                      navigation.navigate('kycImage', { isLoginRoute: true });
                    }
                  }}>
                  <Text style={styles.styleSubmit}>Proceed</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.buttonStyle}
                  onPress={() => setModalVisibleB2B(false)}>
                  <Text style={styles.styleSubmit}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '90%',
  },
  mainSubContainer: {
    padding: 5,
    flexDirection: 'column',
    borderColor: COLOR_CODES.lightGrey_back,
    borderRadius: 5,
    borderWidth: 2,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    ...Specs.fontBold,
    color: COLOR_CODES.buttonBlue,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
    ...Specs.fontBold,
    alignSelf: 'center',
    color: COLOR_CODES.buttonBlue,
  },

  orSubtitle: {
    fontSize: 18,
    marginVertical: 10,
    alignSelf: 'center',
    ...Specs.fontBold,
    color: COLOR_CODES.buttonBlue,
  },
  subHeadingText: {
    fontSize: 16,
    marginVertical: 10,
    ...Specs.fontSemibold,
    color: 'black',
  },
  text: {
    fontSize: 14,
    marginVertical: 5,
    ...Specs.fontRegular,
  },
  buttonStyle: {
    backgroundColor: 'black',
    height: 40,
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 20,
  },
  styleSubmit: {
    color: '#fff',
    fontSize: 20,
    ...Specs.fontMedium,
  },
  videoLinkStyle: {
    marginVertical: 10,
    fontSize: 15,
    color: COLOR_CODES.orange,
  },
});

export default BenifitB2BModal;
