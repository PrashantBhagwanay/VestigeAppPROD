/*eslint-disable */
import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

/**
 * @description The navigation is implemented as a service so that it can be used outside of components, for example in sagas.
 * @see https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
 */
export const navigationRef = createNavigationContainerRef()
let navigator;

/**
 * @description This function is called when the RootScreen is created to set the navigator instance to use.
 */
function setTopLevelNavigator(navigatorRef) {
  navigator = navigatorRef;
}

/**
 * @description Call this function when you want to navigate to a specific route.
 * @param routeName The name of the route to navigate to. Routes are defined in RootScreen using createStackNavigator()
 * @param params Route parameters.
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * @description Call this function when you want to navigate to a specific route AND reset the navigation history.
 * { That means the user cannot go back. This is useful for example to redirect from a splashscreen to
 * the main screen: the user should not be able to go back to the splashscreen. }
 *
 * @param routeName The name of the route to navigate to. Routes are defined in RootScreen using createStackNavigator()
 * @param params Route parameters.
 */
export function navigateAndReset(index, routeName, params) {
  navigationRef.dispatch(
    CommonActions.reset({
      index: index,
      routes: [{ name: routeName, params }],
    }),
  );
}
