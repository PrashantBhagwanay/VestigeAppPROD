/**
 * @description exporting error messages from constants
*/
import { SIGNUP_KEY_ENUM, PICKER_ENUM } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';

export const addressValidator = (address) => {
  let adressWithoutBlankSpace = address.trim();
  if (adressWithoutBlankSpace.length > 0) {
    // const addressRegex = /^[a-zA-Z0-9\s,'-/@#&]{1,100}$/;
    const addressRegex = /^[ A-Za-z0-9_@./#,-]*$/;
    // const addressRegex = /^[ A-Za-z0-9.-,#]*$/;
    if (addressRegex.test(address)) {
      return true;
    }
    // return strings.errorMessage.signUp.invalidAddress;
    // return 'Invalid Address';
    return 'Please entre valid characters in the address fields, Allowed characters are: \n A-Z a-z 0-9 _ @ . / # , -';
  }
  return 'Address Required';
}

/**
 * @function
 * @param {*} validatorType on which field you want to validate 
 */
function nameValidator(name) {
  const nameRegex = /^[a-zA-Z ]+$/;
  if (nameRegex.test(name)) {
    return true;
  }
  return false;
}

function phoneNumberValidator(mobile) {
  const mobileRegex = /[6789]\d{9}/;
  if (mobileRegex.test(mobile)) {
    return true;
  }
  return false;
}

function emailValidator(email) {
  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (emailRegex.test(email)) {
    return true;
  }
  return false;
}

function passwordValidator(password) {
  const passwordRegex = /^[\S]{6,20}$/;
  if(passwordRegex.test(password)) {
    return true;
  }
  return false;
}

function matchPasswordValidator(confirmPassword, password) {
  let isConfirmPasswordValid = passwordValidator(confirmPassword)
  if(isConfirmPasswordValid){
    if(password !== confirmPassword) {
      return false;
    }
    else {
      return true;
    }
  }
  return false;
}

function distributorIdValidator(distributorId) {
  const distributorIdRegex = /^[0-9]{8}$/;
  if (distributorIdRegex.test(distributorId)) {
    return true;
  }
  return false;
}

function validatePanNumber(panNumber){
  var panNumberRegex = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  if (panNumberRegex.test(panNumber)) {
    return true;
  }
  return false;
}

function validateDob(dob){
  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if(age<18){
    return false;
  }
}

function validatePincode(pincode){
  const pinRegex = /[123456789]\d{5}/;
  if (pinRegex.test(pincode)) {
    return true;
  }
  return false;
}

function validateAadhaarNumber(aadhaarNumber){
  const aadhaarRegex = /\d{12}/;
  if (aadhaarRegex.test(aadhaarNumber)) {
    return true;
  }
  return false;
}


const isValidate = (inputKey,inputField) => {
  switch(inputKey){
    case SIGNUP_KEY_ENUM.DISTRIBUTOR_ID : {
      if(!inputField || inputField!==8 || distributorIdValidator(inputField)) {
        return strings.errorMessage.signUp.invalidUpline
      }
      break;
    }

    case PICKER_ENUM.TITLE_PICKER: {
      if(!inputField || inputField === 'Title'){
        return strings.errorMessage.signUp.invalidUserTitle
      }
      break;
    }

    case SIGNUP_KEY_ENUM.FIRSTNAME : {
      if(!inputField || nameValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidName
      }
      break;
    }

    case SIGNUP_KEY_ENUM.LASTNAME: {
      if(!inputField || nameValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidLastName
      }
      break;
    }

    case SIGNUP_KEY_ENUM.DOB: {
      if(!inputField || validateDob(inputField)===false) {
        return strings.errorMessage.signUp.invalidDob
      }
      break;
    }

    case PICKER_ENUM.GENDER_PICKER: {
      if(!inputField ||inputField ==='Gender') {
        return strings.errorMessage.signUp.invalidUserGender
      }
      break;
    }

    case SIGNUP_KEY_ENUM.MOBILE_NUMBER : {
      if(!inputField || phoneNumberValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidPhoneNumber
      }
      break;
    }
    
    case SIGNUP_KEY_ENUM.EMAIL_ID: {
      if(!inputField || emailValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidEmail
      }
      break;
    }

    case SIGNUP_KEY_ENUM.PINCODE : {
      if(!inputField || validatePincode(inputField)===false) {
        return strings.errorMessage.signUp.invalidPinCode
      }
      break;
    }

    case SIGNUP_KEY_ENUM.ADDRESS: {
      if(!inputField || addressValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidAddress
      }
      break;
    }
    case PICKER_ENUM.COUNTRY_PICKER: {
      if(!inputField || inputField === 'Country'){
        return strings.errorMessage.signUp.invalidCountry
      }
      break;
    }
    case PICKER_ENUM.STATE_PICKER: {
      if(!inputField || inputField === 'State'){
        return strings.errorMessage.signUp.invalidState
      }
      break;
    }
    case PICKER_ENUM.CITY_PICKER: {
      if(!inputField || inputField === 'City'){
        return strings.errorMessage.signUp.invalidCity
      }
      break;
    }
    case SIGNUP_KEY_ENUM.PASSWORD : {
      if(!inputField || passwordValidator(inputField)===false) {
        return strings.errorMessage.signUp.invalidPassword
      }
      break;
    }
    case SIGNUP_KEY_ENUM.CONFIRM_PASSWORD: {
      if(!inputField) {
        return strings.errorMessage.signUp.invalidConfirmPassword
      }
      break;
    }
    case PICKER_ENUM.CODISTRIBUTOR_PICKER: {
      if(!inputField || inputField === 'Title'){
        return strings.errorMessage.signUp.invalidCoDistributorTitle
      }
      break;
    }
    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_FIRSTNAME: {
      if(!inputField || nameValidator(inputField) === false) {
        return strings.errorMessage.signUp.invalidCoDistributorName
      }
      break;
    }
    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_LASTNAME: {
      if(!inputField || nameValidator(inputField) === false) {
        return strings.errorMessage.signUp.invalidCoDistributorLastName
      }
      break;
    }
    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_DOB: {
      if(!inputField || validateDob(inputField)===false) {
        return strings.errorMessage.signUp.invalidCodistributorDob
      }
      break;
    }

    case PICKER_ENUM.DISTRIBUTOR_PICKER: {
      if(!inputField || inputField === 'Distributor ID'){
        return strings.errorMessage.signUp.invalidDistributor
      }
      break;
    }

    default : return '';
  }

}

export const maskDate = (text) =>{
  let value = text.replace(/\D/g,'').slice(0, 10);
  if (value.length >= 5) {
    return `${value.slice(0,2)}/${value.slice(2,4)}/${value.slice(4)}`;
  }
  else if (value.length >= 3) {
    return `${value.slice(0,2)}/${value.slice(2)}`;
  }
  return value
}


export const isDistributorIdValidator = (distributorId) => {
  const distributorIdRegex = /^[0-9]{8}$/;
  if (distributorIdRegex.test(distributorId)) {
    return true;
  }
  return false;
}

export const isPanCardValid = (val) => {
  const regPan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  if(regPan.test(val)){
    return true
  }
  return false 
}

export const isSpecialCharacterValidator = value => {
  const format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if(format.test(value)){
    return true;
  } 
  return false;
}

export const isAlphaNumeric = (value) => {
  const regex = /^[a-zA-Z0-9]+$/;
  if (regex.test(value)) {
    return true;
  }
  return false;
};

export const isValidAmount = (value) => {
  const regex = /^[0-9]+\.?[0-9]*$/;
  if (regex.test(value)) {
    return true;
  }
  return false;
};

export const isNameValidator = (name, isDotAllowed) => {
  const nameRegex = /^[a-zA-Z ]+$/;
  const dotOnlyRegex = /^(\.)$/;
  if (nameRegex.test(name)) {
    return true;
  }
  else if(isDotAllowed){
    return dotOnlyRegex.test(name) ? true : false;
  }
  return false;
}

export const isEmailValidate = (email) => {
  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (emailRegex.test(email)) {
    return true;
  }
  return false;
}

export const isPasswordValidate = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
  if(passwordRegex.test(password)) {
    return true;
  }
  return false;
}
export const isValidateDob = (dob, locationId, isNominee) => {
  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if(isNominee){
    if(age < 18 || age > 100){
      return false;
    }
    else{
      return true;
    }
  }
  // if((countryId == '23' && age<20) || age<18){
  //   return false;
  // }
  // else if(age> 100){
  //   return false;
  // }
  // return true
  if(age < 18 || 
      age > 100 || 
      (locationId == '21' && age < 21) || 
      (locationId == '23' && age < 20)){
    return false;
  }
  else{
    return true;
  }
}

export const isPhoneNumberValidate = (mobile) => {
  const mobileRegex = /[6789]\d{9}/;
  if (mobileRegex.test(mobile)) {
    return true;
  }
  return false;
}

export const isMobileNumberValid = (mobile) => /^\d+$/.test(mobile);

export const isPinCodeValidate = (pincode) => {
  const pinRegex = /[0123456789]/;
  if (pinRegex.test(pincode)) {
    return true;
  }
  return false;
}

export const isValidateDate = (date) =>{
  const dateRegex =  /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/;
  if(dateRegex.test(date)){
    return true;
  }
  return false
}

export const isBonusOrGiftVouchersValid = (str) => {
  const regex = /^[a-z0-9/]+$/i
  if(regex.test(str)) {
    return true
  }
  return false
}

export const isAddressValidate = (address) => {
  const addressRegex = /^[ A-Za-z0-9_@./#,-]*$/;
  if (addressRegex.test(address)) {
    return true;
  }
  return false;
}

export const isNomineeAddressValid = (address) => /^[ A-Za-z0-9_@./#,-]*$/.test(address);

export const isMatchPasswordValidate = (confirmPassword, password) => {
  if(password === confirmPassword) {
    return true
  }
  else {
    return false;
  }
}

export const  isAddarValidate = (addarNumber) => {
  const addarRegex = /^\d{12}$/;
  if (addarRegex.test(addarNumber)) {
    return true;
  }
  return false;
}

export const  isPassPortValidate = (passport) => {
  const passportRegex = /^(?!^0+$)[a-zA-Z0-9]{3,20}$/;
  if (passportRegex.test(passport)) {
    return true;
  }
  return false;
}

export const isIFSC = (ifsc) => {
  const regexIFSC = /^[A-Za-z]{4}\d{7}$/;
  return regexIFSC.test(ifsc);
}

export default isValidate;