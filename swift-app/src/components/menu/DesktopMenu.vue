<template>
  <div class="homemenu">
    <!-- <MenuSearchToolBar></MenuSearchToolBar> -->
    <div v-show="isLoading" style="display: flex; align-items: center; justify-content: center;">
      <v-progress-circular style="height: 400px" indeterminate color="primary"></v-progress-circular>
    </div>
    <v-container v-show="!isLoading" class="pb-0">
        <div class="backgroundImage" style="margin-top: 0px">
          <v-row style="margin-top: -12px; margin-bottom: 0px"> 
              <v-col cols="12" class="pt-0 px-0 pb-0">
                <v-carousel height="200px" :show-arrows="false" hide-delimiter cycle hide-delimiters continuous>
                  <v-carousel-item gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.4)" :src="menu.image">
                    <v-row  align="center" justify="center" class="mt-6">
                      <v-col cols="12" v-if="checkedIn()" class="white--text display-1 py-0" style="text-align: center;">Welcome to {{menu.name}}</v-col>
                      <v-col cols="12" v-if="!checkedIn()" class="white--text display-1 py-0" style="text-align: center;">{{menu.name}}</v-col>
                    </v-row>
                    <v-row  align="center" justify="center" class="mt-2">
                      <v-col cols="9" class="mt-3">
                        <v-text-field background-color="white" class="menuItemSearchbar"  v-model="search" rounded clearable solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search..."></v-text-field>
                      </v-col>
                      <v-col cols="1" class="d-flex align-center px-0 mt-3">
                        <v-btn small icon color="white">
                          <v-icon size="24px">mdi-filter-variant</v-icon> 
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-carousel-item>
                </v-carousel>
                <v-btn width="30px" height="30px" @click="backNavigation" color="secondary" absolute small fab style="top: 20px; left: 15px;">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <!-- <v-btn v-if="checkedIn()" width="30px" height="30px" @click="callWaiterPressed()" :key="activeCall.icon" :color="activeCall.color" absolute small fab style="top: 20px; right: 10px;">
                  <v-icon class="callWaiter" :style="called ? { 'animation-name': 'callWaiterAnimation', 'animation-duration': '5s' } : { 'transform': 'rotate(0deg)' }">{{ activeCall.icon }}</v-icon>
                </v-btn> -->
              </v-col>
            </v-row>
          </div>
      </v-container>

      <v-container v-show="!isLoading && filterPromotionItems(promotionItems).length != 0" class="mt-0 pt-0 d-flex flex-column" style="padding-bottom: 0;">
        <v-row v-show="!isLoading && filterPromotionItems(promotionItems).length != 0" class="overflow-y-auto pt-2" >
          <v-col cols="12" class="py-0 mb-0">
            <div class="subtitle">Suggested for you</div>
          </v-col>
        </v-row>        
        <v-row v-show="!isLoading" class="mx-0 px-0 d-flex align-baseline">
          <v-carousel class="promotionalMaterial mt-0 pt-0 mb-2" v-show="!isLoading && filterPromotionItems(promotionItems).length != 0" v-model="carouselIndex" :continuous="true" :cycle="true" :show-arrows="false" hide-delimiter-background :delimiter-icon="carouselTab" height="160px">
            <v-carousel-item v-for="(promotionItem, i) in filterPromotionItems(promotionItems).slice(0, 5)" :key="i">
              <v-sheet :color="(i % 2 === 0) ? 'secondary' : 'accent'" height="150px" flat tile style="border-radius: 10px !important" class="mt-2">
                <v-row @click="goToMenuItem(promotionItem.menuItemId)"  class="d-flex justify-space-between px-0 py-0">
                  <v-col cols="6" class="py-3 pr-0">
                    <v-layout column justify-space-between fill-height>
                      <div class="px-3">
                        <span class="specialsText font-weight-light">{{ promotionItem.menuItemName }}</span>
                        <div class="mt-1 specialsDate">{{ promotionItem.menuItemDescription }}</div>
                        <v-rating background-color="white" readonly size="11" dense color="yellow darken-3" :value="parseInt(promotionItem.rating)"></v-rating>
                      </div>
                      <div class="px-3">
                        <span class="subtitle-1">R{{ (promotionItem.price).toFixed(2) }}</span>
                      </div>
                    </v-layout>
                  </v-col>
                  <v-col cols="6" class="py-0">
                    <v-layout column >
                      <v-img class="mt-0 pt-0 promoImage" height="150px" v-if="promotionItem.images.length !=  0" :src="promotionItem.images[0]"/>
                      <v-img class="mt-0 pt-0 promoImage" height="150px" v-else src="../../assets/menuItemImages/item-placeholder.png"/>
                    </v-layout>
                  </v-col>
                </v-row>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-row>
      </v-container> 

      <v-container v-if="search == ''" v-show="!isLoading" class="px-0 pt-0 overflow-x-hidden" transition="slide-x-transition">
        <v-tabs v-model="secondaryCategoryTab" background-color="secondary" color="primary" dark>
          <v-tab v-for="(category, index) in primaryCategoryList" :key="index" style="padding-left: 80px;">
            {{ category.categoryName }}
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="secondaryCategoryTab">
          <v-tab-item v-for="(category, index) in primaryCategoryList" :key="index" style="padding-left: 70px;">
            <div v-if="category.menuItems.length == 0">
              <v-list v-for="(secondary, i) in secondaryCategoryList(category.categoryId)" :key="i" class="py-0">
                <div class="ml-2 mt-2">{{secondary.categoryName}}</div>
                <v-list  v-for="(menuItem, i) in secondary.menuItems" :key="i" class="py-0">
                  <v-list-item v-if="menuItem.availability" style="opacity: 1" @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1">
                    <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
                      <img v-if="menuItem.images.length != 0" :src="menuItem.images[0]">
                      <img v-else src="../../assets/menuItemImages/item-placeholder.png">
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
                      <v-list-item-subtitle v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
                    </v-list-item-content>
                    <span class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</span>
                  </v-list-item>
                  <v-list-item v-else style="opacity: 0.3" @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1">
                    <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
                      <img v-if="menuItem.images.length != 0" :src="menuItem.images[0]">
                      <img v-else src="../../assets/menuItemImages/item-placeholder.png">
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
                      <v-list-item-subtitle v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
                    </v-list-item-content>
                    <span class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</span>
                  </v-list-item>
                  <v-divider divider class="ml-3" width="93%"></v-divider>
                </v-list>
              </v-list>
            </div>

            <div v-else>
              <v-list v-for="(menuItem, i) in category.menuItems" :key="i" class="py-0">
                <v-list-item @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1 ">
                  <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
                    <img v-if="menuItem.images.length != 0" :src="menuItem.images[0]">
                    <img v-else src="../../assets/menuItemImages/item-placeholder.png">
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
                    <v-list-item-subtitle class="mt-2" v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
                  </v-list-item-content>
                  <div class="d-flex flex-column justify-content-end">
                    <v-rating readonly size="14" dense color="yellow darken-3" background-color="secondary" :value="parseInt(menuItem.rating)"></v-rating>
                    <!-- <v-list-item-action-text class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</v-list-item-action-text> -->
                    <span class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</span>
                  </div>                
                </v-list-item>
                <v-divider divider class="ml-3" width="93%"></v-divider>
              </v-list>
            </div>
          </v-tab-item>
        </v-tabs-items>

        <!-- <div v-for="(suggestedItem, i) in filteredSuggestions(suggestedItems)" :key="i">
          
        </div> -->

      </v-container>

      <v-container v-if="search != ''" v-show="!isLoading" class="pa-0">
        <v-tabs background-color="secondary" color="primary" dark>
          <v-tab style="padding-left: 80px;">
            Results:
          </v-tab>
        </v-tabs>
        <v-list  v-for="(menuItem, i) in searchItemsList()" :key="i" class="py-0" style="padding-left: 80px;">
          <v-list-item v-if="menuItem.availability" style="opacity: 1" @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1">
            <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
              <img v-if="menuItem.images.length != 0" :src="menuItem.images[0]">
              <img v-else src="../../assets/menuItemImages/item-placeholder.png">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
              <v-list-item-subtitle v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
            </v-list-item-content>
            <span class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</span>
          </v-list-item>
          <v-list-item v-else style="opacity: 0.3" @click="goToMenuItem(menuItem.menuItemId)"  ripple class="py-1">
            <v-list-item-avatar tile  style="border-radius: 4px" size="45" >
              <img v-if="menuItem.images.length != 0" :src="menuItem.images[0]">
              <img v-else src="../../assets/menuItemImages/item-placeholder.png">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-html="menuItem.menuItemName"></v-list-item-title>
              <v-list-item-subtitle v-html="menuItem.menuItemDescription"></v-list-item-subtitle>
            </v-list-item-content>
            <span class="subtitle-1">R{{ (menuItem.price).toFixed(2) }}</span>
          </v-list-item>
          <v-divider divider class="ml-3" width="93%"></v-divider>
        </v-list>
        <!-- <div v-else class="pl-1 py-0 restaurantLocation font-weight-light" style="display: inline; font-size: 15px">No search results...</div> -->
      </v-container> 
    <!-- <v-snackbar :v-if=checkedIn id="notification" :timeout="2000" centered color="primary" elevation="24" v-model="snackbar">You have been checked-in to {{menu.name}}</v-snackbar> -->
    <!-- <NavBar></NavBar> -->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import DesktopNavbar from "@/components/layout/DesktopNavbar";
import MenuSearchToolBar from "@/components/layout/MenuSearchToolBar";
import $ from 'jquery';
import store from '@/store/store.js';

$(window).scroll(function(){
  $(".backgroundImage").css("opacity", 1 - $(window).scrollTop() / 250);
});


export default {
  name: 'DesktopMenu',
  components: {
    DesktopNavbar: DesktopNavbar,
    MenuSearchToolBar: MenuSearchToolBar
  },
  data: () => ({
    restaurantImages: [
      { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
    ],
    isLoading: false,
    search: '',
    primaryCategoryTab: null,
    secondaryCategoryTab: null,
    called: false,
    favourited: false,
    snackbar: true,
    carouselIndex: 0,
    isMobile: false,
    busySearching: false
  }),
  methods: {
    goToMenuItem(id) {
      this.$router.push("/menuItem/" + id);
    },
    changeFavouriteFab() {
      this.favourited = !this.favourited;
    },
    backNavigation () {
      this.$router.push('/')
    },
    onResize () {
      this.isMobile = window.innerWidth < 600
    },
    
    async callWaiterPressed() {
      // var tableId = localStorage.getItem('checkedInTableId');
      // await this.callWaiter(checkedInTableId)
      this.called = true; 
      
      setTimeout(() => { 
        this.called = false;
      }, 5000);
    },
    checkedIn() {
      let checkedInVal = this.checkedInQRCode;
      let checkedInRestaurantId = this.checkedInRestaurantId;

      if (checkedInVal != null && checkedInRestaurantId != null) {
        if (this.$route.params.menuId == checkedInRestaurantId) {
          return true;
        } 
      } else {
        return false
      }
    },    
    secondaryCategoryList(id) {
      if (this.menu.categories != undefined) {
        if (this.search == '') {
          var list =  this.menu.categories.filter((category, index) => {
            return category.type == "secondary" && category.parentCategoryId == id
          })
          return list
        } /* else {
          var list = [];
            for (let i = 0; i < this.menu.categories.length; i++) {
              for (let j = 0; j < this.menu.categories[i].menuItems.length; j++) {
                if (this.menu.categories[i].menuItems[j].menuItemName.toLowerCase().includes(this.search.toLowerCase())) {
                  // console.log(this.menu.categories[i].menuItems[j])
                  list.push(this.menu.categories[i]);
                }
              }
            }
        } */
      }
    },
    searchItemsList() {
      if (this.search != '') {
        console.log("in here")
        var list = [];
        for (let i = 0; i < this.menu.categories.length; i++) {
          for (let j = 0; j < this.menu.categories[i].menuItems.length; j++) {
            if (this.menu.categories[i].menuItems[j].menuItemName.toLowerCase().includes(this.search.toLowerCase())) {
              list.push(this.menu.categories[i].menuItems[j]);
            }
          }
        }
        console.log(list)
        return list;
      }
    },
    searchForItem(items) {
      if (items != undefined) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].menuItemName.toLowerCase().includes(this.search.toLowerCase())) {
            return items[i]
          } else {
            return null;
          }
        }
        
      }
    },
    filterPromotionItems(promotionItems) {
      var promotionItemsList = [];

      for (let i = 0; i < promotionItems.length; i++) {
        var tempList = [];
        for (let j = 0; j < promotionItems[i].antecedents.length; j++) {
          tempList.push(promotionItems[i].antecedents[j])
          
          var tempList2 = [];
          for (let k = 0; k < this.orderHistory.length; k++) {
            if (this.orderHistory[k].items != undefined) {
              for (let l = 0; l < this.orderHistory[k].items.length; l++) {
                if (promotionItems[i].antecedents[j] === this.orderHistory[k].items[l].menuItemId) {
                  tempList2.push(promotionItems[i].antecedents[j])
                }
              }
            }
          }

          if (tempList.length == tempList2.length) {
            for (let k = 0; k < promotionItems[i].consequents.length; k++)
              promotionItemsList.push(promotionItems[i].consequents[k])
          }
        }
      }
     
      var uniquePromotionItems = [];

      $.each(promotionItemsList, function(i, el){
        if($.inArray(el, uniquePromotionItems) === -1) uniquePromotionItems.push(el);
      });
      
      var promotionMenuItems = [];

      for (let i = 0; i < uniquePromotionItems.length; i++) {
        var menuItem = this.retrievMenuItem(uniquePromotionItems[i])
        if (menuItem != undefined)
          promotionMenuItems.push(menuItem);        
      }

      return promotionMenuItems;
    },
    retrievMenuItem(menuId) {
      if (this.findCategory(menuId) != undefined)
        return this.findCategory(menuId).menuItems.find(menuItem => menuItem.menuItemId === menuId )
    },
    findCategory(menuId) {
      if (this.menu.categories != undefined) {
        return  this.menu.categories.find(
          (category) => {
            if (category.menuItems != undefined)
              return category.menuItems.find(menuItem => menuItem.menuItemId === menuId )
          }
        )
      } 
    },
  },
  async mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })

    this.clearItem;
    if (this.displayNotification) {
      document.getElementById("notification").style.display = "block";
      this.updateDisplayNotification(false);
    }

    // var menuObj = await this.menu;
    
    if (Object.keys(this.menu).length == 0 || Object.keys(this.menu).length == undefined) { 
      this.isLoading = !this.isLoading;
      var menuResponse = await this.$store.dispatch('MenuStore/retrieveMenu', this.$route.params.menuId);
      
      if (this.promotionItems.length == 0)
        await this.$store.dispatch('MenuStore/retrieveSuggestedPromotions', this.$route.params.menuId);
      
      if (menuResponse)
        this.isLoading = !this.isLoading;
    } else {
      this.isLoading = !this.isLoading;
      if (this.promotionItems.length == 0) {
        await this.$store.dispatch('MenuStore/retrieveSuggestedPromotions', this.$route.params.menuId);
      }
      this.isLoading = !this.isLoading;
    }
  },
  computed: {
    activateFavourite() {
      if (!this.favourited) {
        return { color: "primary", icon: "mdi-heart-outline" };
      } else {
        return { color: "primary", icon: "mdi-heart" };
      }
    },
    carouselTab () {
      return 'mdi-checkbox-blank-circle';
    },
    ...mapActions({
      retrieveMenu: 'MenuStore/retrieveMenu',
      callWaiter: 'CustomerStore/callWaiter',
      clearItem: "MenuItemsStore/clearItem",
    }),
    ...mapGetters({
      menu: "MenuStore/getMenu",
      // checkedInStatus: 'CustomerStore/getCheckedInStatus',
      checkedInQRCode: 'CustomerStore/getCheckedInQRCode',
      checkedInRestaurantId: 'CustomerStore/getCheckedInRestaurantId',
      checkedInTableId: 'CustomerStore/getCheckedInTableId',
      promotionItems: 'MenuStore/getPromotionItems',
      orderHistory: 'CustomerStore/getCustomerOrderHistory',
    }),
    activeCall() {
      if (!this.called) {
        return { color: "white", icon: "mdi-bell-outline" };
      } else {
        return { color: "primary", icon: "mdi-bell-outline" };
      }
    },
    filteredList() {
      if (this.menu.categories != undefined) {
        return this.menu.categories.filter(category => {
          return category.categoryName.toLowerCase().includes(this.search.toLowerCase())
        })
      }
    },
    filteredSuggestions(promotionItems) {

    },
    primaryCategoryList() {
      if (this.menu.categories != undefined) {
        var list = this.menu.categories.filter(category => {
          return category.type == "primary"/*  && this.searchForItem(category.menuItems) */
        })

        return list;
      }
    },
    
  },
};
</script>

<style>
#notification {
  display: none;
  position: absolute; 
  top: 0; 
  margin-top: 20px;
}

#categories {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.v-tabs:not(.v-tabs--vertical):not(.v-tabs--right) > .v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-tabs-bar--show-arrows):not(.v-slide-group--has-affixes) .v-slide-group__prev {
  display: none
}

input, label, .mdi-magnify, .mdi-menu-down {
  color: #343434 !important;
}

label {
  opacity: 0.55;
}

.v-text-field--rounded > .v-input__control > .v-input__slot {
  padding-left: 18px;
}
.menuItemSearchbar {
  background: rgba(0, 0, 0, 0.06) !important;
  caret-color: #343434 !important;
  color: #343434 !important;
}

.promoImage {
  border-top-right-radius: 13px;
  border-bottom-right-radius: 13px;
}

@keyframes callWaiterAnimation {
  0%   {transform: rotate(0deg);}
  5%   {transform: rotate(-45deg);}
  10%   {transform: rotate(0deg);}
  15%   {transform: rotate(45deg);}
  20%   {transform: rotate(0deg);}
  25%   {transform: rotate(-45deg);}
  30%   {transform: rotate(0deg);}
  35%   {transform: rotate(45deg);}
  40%   {transform: rotate(0deg);}
  45%   {transform: rotate(-45deg);}
  50%   {transform: rotate(0deg);}
  55%   {transform: rotate(45deg);}
  60%   {transform: rotate(0deg);}
  65%   {transform: rotate(-45deg);}
  70%   {transform: rotate(0deg);}
  75%   {transform: rotate(45deg);}
  80%   {transform: rotate(0deg);}
  85%   {transform: rotate(-45deg);}
  90%   {transform: rotate(0deg);}
  95%   {transform: rotate(45deg);}
  100%   {transform: rotate(0deg);}
}

</style>
