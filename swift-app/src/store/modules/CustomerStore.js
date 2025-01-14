import axios from 'axios'
const {OAuth2Client} = require('google-auth-library');

// State object
const initialState = () => ({
  customer: {},
  isAuthenticated: false,
  token: null,
  checkedInStatus: null,
  checkedInQRCode: null,
  checkedInRestaurantId: null,
  checkedInTableId: null,
  fetchedOrderHistory: null
});

const state = initialState();

// Getter functions
const getters = {
  getCustomerProfile( state ) {
    return state.customer;
  },
  getCustomerOrderHistory( state ) {
    // console.log(state.customer.orderHistory)
    return state.customer.orderHistory;
  },
  getToken( state ) {
    return state.token;
  },
  getCheckedInStatus( state ) {
    return state.checkedInStatus;
  },
  getCheckedInQRCode( state ) {
    return state.checkedInQRCode;
  },
  getCheckedInRestaurantId( state ) {
    return state.checkedInRestaurantId;
  },
  getCheckedInTableId( state ) {
    return state.checkedInTableId;
  },
  getFetchedOrderHistory( state ) {
    return state.fetchedOrderHistory;
  },
  isAuthenticated(state) {
    return state.isAuthenticated;
  }
}

// Actions 
const actions = {
  checkInCustomer({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "checkin",
        "qrcode": data.qrcode,
        "token": sessionStorage.getItem('authToken'),
      }
    ).then(result => {
      commit('SET_CHECKED_IN_CODE', data.qrcode);
      commit('SET_CHECKED_IN_RESTAURANT_ID', result.data.restaurantId);
      commit('SET_CHECKED_IN_TABLE_ID', result.data.tableId);
      return result.data;
    }).catch(({ response }) => {
    });
  },

  checkInCustomerManually({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "checkinCode",
        "code": data.code,
        "token": sessionStorage.getItem('authToken'),
      }
    ).then(result => {
      // console.log(result.data)
      commit('SET_CHECKED_IN_CODE', result.data.qrCode);
      commit('SET_CHECKED_IN_RESTAURANT_ID', result.data.restaurantId);
      commit('SET_CHECKED_IN_TABLE_ID', result.data.tableId);
      return result.data;
    }).catch(({ response }) => {
    });
  },

  checkOutCustomer({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "checkout",
        "token": sessionStorage.getItem('authToken'),
      }
    )
  },

  //send url to api
  handleGoogle({commit}, code)
  {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "handleGoogle",
      "code" : code
    }).then(result => {
      // console.log("result.data.token");
      commit('SAVE_TOKEN', result.data.token);
      sessionStorage.setItem('authToken', result.data.token);
      commit('SET_CHECKED_IN_CODE', result.data.checkedIn);
      commit('SAVE_CUSTOMER', result.data);
      // this.dispatch('OrderStore/initOrderHistory');
      this.dispatch('OrderStore/ratingPhrasesRestaurant');
      
    }).then(result => {
      let checkedInVal = this.getters['CustomerStore/getCheckedInQRCode'];
      if (checkedInVal != null && this.getters['CustomerStore/getCheckedInRestaurantId'] == null) {
        this.isLoading = true;
        var data = {
          "qrcode": checkedInVal
        }
        
        this.dispatch('CustomerStore/checkInCustomer', data);
        this.dispatch('OrderStore/initOrderHistory');
        
      }
      return "Success";
    }).catch(({ response }) => {
      return "Fail";
    }); 
  },

  login({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "login",
        "email": data.email,
        "password": data.password
      }
    ).then(result => {
      commit('SAVE_TOKEN', result.data.token);
      sessionStorage.setItem('authToken', result.data.token);
      commit('SET_CHECKED_IN_CODE', result.data.checkedIn);
      commit('SAVE_CUSTOMER', result.data);
      // this.dispatch('OrderStore/initOrderHistory');
      this.dispatch('OrderStore/ratingPhrasesRestaurant');
    }).then(result => {
      let checkedInVal = this.getters['CustomerStore/getCheckedInQRCode'];
      if (checkedInVal != null && this.getters['CustomerStore/getCheckedInRestaurantId'] == null) {
        this.isLoading = true;
        var data = {
          "qrcode": checkedInVal
        }

        this.dispatch('CustomerStore/checkInCustomer', data);
        this.dispatch('OrderStore/initOrderHistory');
      }
      
      return "Success";
    }).catch(({ response }) => {
      return "Fail";
    });
  },

  googleLogin({commit}) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "loginGoogle"
    } 
    ).then(result => {
      return result.data.url
    }).catch(({ response }) => {
      return response.data.url
    });
  },

  register({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
      {
        "requestType": "register",
        "name": data.name,
        "surname": data.surname,
        "email": data.email,
        "password": data.password
      }
    ).then(result => {
      this.dispatch('CustomerStore/login', data);
    }).then(result => {
      return true;
    })
  },

  googleRegister({commit}) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "loginGoogle"

    } 
    ).then(result => {
      return response.data.url
    }).catch(({ response }) => {
      return response.data.url
    });
  },

  addFavourite({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "addFavourite",
      // "token": this.getters['CustomerStore/getToken'],
      "token": sessionStorage.getItem('authToken'),
      "menuItemId": data.menuItemId
    } 
    ).then(result => {
      commit('UPDATE_FAVOURITES', result.data.favourites);
    }).catch(({ response }) => {
    });
  },

  removeFavourite({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "removeFavourite",
      "token": this.getters['CustomerStore/getToken'],
      "menuItemId": data.menuItemId
    } 
    ).then(result => {
      commit('UPDATE_FAVOURITES', result.data.favourites);
    }).catch(({ response }) => {
    });
  },

  editProfile({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "editProfile",
      "name": data.name,
      "surname": data.surname,
      "profileImage": data.profileImage,
      "theme": data.theme,
      "token": sessionStorage.getItem('authToken')
    }).then(result => {
      commit('EDIT_PROFILE', result.data.profileInfo);
    }).catch(({ response }) => {
      return response
    });
  },

  callWaiter({commit}, data) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "callWaiter",
      "tableId": data.tableId,
      "token": sessionStorage.getItem('authToken')
    })
  },

  fetchOrderHistory({commit}) {
    axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "orderHistory",
      "token": sessionStorage.getItem('authToken'),
    } 
    ).then(result => {
      commit('SET_FETCHED_ORDER_HISTORY', result.data.orderHistory);
      this.dispatch('OrderStore/setOrderHistory', result.data.orderHistory);
    }).catch(({ response }) => {
    });
  },
  
  reset({ commit }) {
    commit('RESET');
  },

  resetPassword({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "reset",
      "email": data.email
    }).then(result => {
      return result.data
    }).catch(({ response }) => {
      return response
    });
  },

  verifyCode({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "verify",
      "email": data.email,
      "code": data.code
    }).then(result => {
      return result.data
    }).catch(({ response }) => {
      return response
    });
  },

  updatePassword({commit}, data) {
    return axios.post('https://api.swiftapp.ml', 
    {
      "requestType": "updatePassword",
      "email": data.email,
      "password": data.password
    }).then(result => {
      return result.data
    }).catch(({ response }) => {
      return response
    });
  }
}

// Mutations
const mutations = {
  SAVE_TOKEN(state, token) {
    state.token = token;
  },

  SAVE_CUSTOMER(state, customer) {
    state.customer = customer;
  },

  UPDATE_FAVOURITES(state, data) {
    state.customer.favourites = data;
  },

  UPDATE_CHECKED_IN(state, status) {
    state.checkedIn = data;
  },

  SET_CHECKED_IN_STATUS(state, status) {
    state.checkedInStatus = status;
  },

  SET_CHECKED_IN_CODE(state, qrcode) {
    state.checkedInQRCode = qrcode;
  },

  SET_CHECKED_IN_RESTAURANT_ID(state, id) {
    state.checkedInRestaurantId = id;
  },

  SET_CHECKED_IN_TABLE_ID(state, id) {
    state.checkedInTableId = id;
  },

  SET_AUTHENTICATION(state, authentication_state) {
    state.isAuthenticated = authentication_state;
  },

  EDIT_PROFILE(state, profileInfo) {
    state.customer.name = profileInfo.name;
    state.customer.surname = profileInfo.surname;
    state.customer.profileimageurl = profileInfo.profileImage;
    state.customer.theme = profileInfo.theme;
  },

  SET_FETCHED_ORDER_HISTORY(state, orderHistory) {
    state.fetchedOrderHistory = orderHistory.orderHistory;
  },

  RESET_FETCHED_ORDER_HISTORY(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      fetchedOrderHistory[key] = newState[key]
    });
  },

  UPDATE_ORDER_HISTORY(state, orderInformation) {
    // console.log('hey, hey')
    state.customer.orderHistory = orderInformation;
  },

  UPDATE_ORDER_STATUS(state, orderStatus) {
    let customerOrder = state.customer.orderHistory.find(order => 
      order.orderId === orderStatus.id  
    )
    // console.log(customerOrder)
    if (customerOrder)
      customerOrder.orderStatus = orderStatus.status
    // console.log(state.customer.orderHistory)
  },

  UPDATE_ORDER_PROGRESS(state, orders) {
    let active = [];
    active = state.customer.orderHistory.filter(order => 
      parseInt(order.progress) < 100  
    )

    if (active.length > 0) {
      for (let i = 0; i < active.length; i++) {
        let found = false;
        for (let y = 0; y < orders.length; y++) {
          if (active[i].orderId == orders[y].orderId)
            found = true;
        }

        if (!found) {
          for (let y = 0; y < active[i].items.length; y++) {
            active[i].items[y].progress = 100;
          }
          active[i].progress = 100;
        }
      }
    }

    for (let i = 0; i < orders.length; i++) {
      let activeOrder = state.customer.orderHistory.find(order => 
        order.orderId === orders[i].orderId  
      )

      if (activeOrder) {
        activeOrder.progress = orders[i].orderProgress;
        for (let y = 0; y < orders[i].itemProgress.length; y++) {
          let item = activeOrder.items.find(orderItem => 
            orderItem.menuItemId === orders[i].itemProgress[y].menuItemId  
          )
          if (item) {
            item.progress = orders[i].itemProgress[y].progress
          }
        }
      }
    }
  },

  RESET(state) {
    const newState = initialState();
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    });
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

