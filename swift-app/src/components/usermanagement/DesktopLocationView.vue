<template>
  <v-container fluid>
      <v-container>
        <v-card flat tile>
          <v-card class="mx-auto" flat>
            <v-row justify="center" class="mt-1">
              <v-avatar size="180px" color="#F5F5F5" justify="center">
                <v-icon color="primary" size="100">mdi-map-marker</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="mt-12" justify="center">
              <span  style="font-size: 25px">Enable Location</span>
            </v-row>
            <v-row justify="center" class="mt-4 mb-6">
              <span style="font-size: 16px; text-align: center; opacity: 0.7" class="font-weight-light">Enable your phone's location to show the restaurant's nearest you</span>
            </v-row>
          </v-card>
        </v-card>
        <v-row class="mt-6 mb-4" justify="center">
          <v-col cols="11" class="pt-0 mb-10" width="100%" style="position: absolute; bottom: 0;">
            <v-row class="d-flex justify-space-around">
              <v-col cols="5" class="pa-0" align="center">
                <v-btn rounded color="white" elevation="2" class="mr-2 body-2" width="90%" height="41px" style="font-size: 16px !important" @click="redirectToHome">Not Now</v-btn>
              </v-col>
              <v-col cols="5" class="pa-0" align="center">
                <v-btn rounded color="accent" elevation="2" class="mr-2 body-2" width="90%" height="41px" style="font-size: 16px !important" @click="enableLocation">Enable</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
// import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

export default {
  name: 'DesktopLocation',
    data() {
    return {
     
    }
  },
  methods: {
    backNavigation () {
      this.$router.pop()
    },
    redirectToHome () {
      this.$router.push('/')
    },
    enableLocation () {
      var onSuccess = function(position) {
        console.log(
          'Latitude: '    + position.coords.latitude                + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n'
        );
      };

      var onError = function(error) {
        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
      this.$router.push('/')
    },
  },
  computed: {
  
  },
};
</script>
