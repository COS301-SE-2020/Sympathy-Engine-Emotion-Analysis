<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Orders</h2>
      </div>
      <label class="mr-4">Show past orders</label>
      <vs-switch color="success" v-model="showAll" />
      <label class="mr-4 ml-4">Show all waiter's orders</label>
      <vs-switch color="success" v-model="showAllWaiters" />
      <label class="mr-4 ml-4">Show orders from</label>
      <datepicker
        title="test"
        placeholder="Select Date"
        v-model="showFromDate"
      ></datepicker>
    </div>
    <vs-row
      v-if="orderCount <= 0"
      vs-type="flex"
      vs-justify="center"
      vs-align="center"
      vs-w="12"
    >
      <vs-col class="mt-20" vs-sm="12" vs-lg="6">
        <vx-card>
          <h5 class="mb-1 text-center">No Orders Yet</h5>
        </vx-card>
      </vs-col>
    </vs-row>
    <div class="vx-row">
      <div
        v-for="(order, index) in orders"
        :key="index"
        class="vx-col w-full sml:w-1/1 md:w-1/2 lg:w-1/4 xl:w-1/4 mb-base"
      >
        <vx-card
          :title="'Order: Table ' + order.tableNumber"
          :subtitle="'Placed: ' + orderTimePlaced(order.orderDateTime)"
          collapse-action
          :data-item-count="orderCount"
          :data-progress="order.orderProgress"
          :id="'OrderCard' + order.orderId"
        >
          <vs-chip class="employeeName" color="success"
            >Status: {{ order.orderStatus }}</vs-chip
          >
          <vs-chip class="employeeName" color="primary"
            >Waiter: {{ order.employeeName }}
            {{ order.employeeSurname }}</vs-chip
          >

          <vs-divider border-style="solid" color="white"></vs-divider>
          <p>Order Progress:</p>
          <vs-progress
            :height="8"
            :percent="parseInt(order.orderProgress)"
            :color="getStatusColor(order.orderProgress)"
          ></vs-progress>
          <vs-list>
            <vs-list-header
              :title="'Order Total: R' + order.orderTotal"
            ></vs-list-header>
            <div
              v-for="(menuItem, index) in order.orderDetails.items"
              :key="index"
              class="singleMenuItem"
            >
              <vs-row>
                <vs-chip color="primary"
                  >R{{ menuItem.itemTotal.toFixed(2) }}</vs-chip
                >
                <vs-chip color="success">Qty: {{ menuItem.quantity }}</vs-chip>

                <vs-list-item
                  :title="menuItem.menuItemName"
                  :subtitle="menuItem.menuItemDescription"
                >
                  <vs-button
                    class="ml-4"
                    :id="
                      'ItemProgressOrderID' +
                      order.orderId +
                      'ItemID' +
                      menuItem.menuItemId
                    "
                    :data-progress="menuItem.progress"
                    size="small"
                    :color="getStatusColor(menuItem.progress)"
                    @click.stop="
                      updateMenuItemProgress(order.orderId, menuItem.menuItemId)
                    "
                    >{{ getMenuItemStatus(menuItem.progress) }}</vs-button
                  >
                </vs-list-item>
              </vs-row>
              <vs-collapse
                v-if="menuItem.orderselections0"
                type="margin"
                class="pt-0"
              >
                <vs-collapse-item class="addonsSection">
                  <div slot="header">Add-ons</div>
                  <vs-list-item
                    v-for="selection in menuItem.orderselections.selections"
                    :key="selection.name"
                    :title="selection.name"
                    >{{ selection.values }}</vs-list-item
                  >
                </vs-collapse-item>
              </vs-collapse>
            </div>
          </vs-list>
        </vx-card>
      </div>
    </div>
  </div>
</template>
       

<script>
import moduleDataList from "@/store/orders/orderDataList.js";
import Datepicker from "vuejs-datepicker";
import $ from "jquery";

export default {
  components: {
    Datepicker,
  },
  data() {
    return {
      isMounted: false,
      showAll: false,
      showAllWaiters: true,
      showFromDate: null,
    };
  },
  computed: {
    orders() {
      var filteredOrders = null;
      if (this.$store.state.orderList) {
        //status filter
        if (this.$store.state.orderList.orders)
          if (this.showAll) {
            filteredOrders = this.$store.state.orderList.orders;
          } else {
            filteredOrders = this.$store.state.orderList.orders.filter(
              (i) => i.orderStatus != "Paid"
            );
          }
        //waiter filter
        if (!this.showAllWaiters && filteredOrders) {
          filteredOrders = filteredOrders.filter(
            (i) =>
              i.employeeName + " " + i.employeeSurname ==
              this.activeUserInfo.displayName
          );
        }
        //date filter
        if(filteredOrders)
        filteredOrders = filteredOrders.filter(
          (i) => new Date(i.orderDateTime) > this.showFromDate
        );
      }
      return filteredOrders;
    },
    orderCount() {
      if (this.orders) return this.orders.length;
      else return 0;
    },
    activeUserInfo() {
      if (localStorage.getItem("userInfo") === null)
        return this.$store.state.AppActiveUser;
      else return JSON.parse(localStorage.getItem("userInfo"));
    },
  },
  methods: {
    orderTimePlaced(time) {
      return (
        new Date(time).toLocaleTimeString() +
        ", " +
        new Date(time).toDateString()
      );
    },
    increaseItemPercentage(orderId, itemId, percentage) {
      this.$store.dispatch("orderList/increaseItemPercentage", {
        orderId: orderId,
        menuItemId: itemId,
        percentage: percentage,
        authKey: this.getAuthToken(),
      });
    },
    listOrders() {
      this.$store.dispatch("orderList/listOrders", {
        authKey: this.getAuthToken(),
        currentRestaurantId: this.getCurrentRestaurantId(),
      });
    },
    getStatusColor(percentage) {
      if (percentage < 10) return "danger";
      if (percentage < 80) return "warning";
      return "success";
    },
    getMenuItemStatus(percentage) {
      if (percentage < 10) return "Item In Progress";
      if (percentage < 80) return "Item Nearly Complete";
      return "Item Complete";
    },
    updateMenuItemProgress(orderId, itemId) {
      var currentProgress = parseInt(
        $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
          "data-progress"
        )
      );

      let progress = currentProgress + 100 / 3;
      if (progress > 99) progress = 100;

      $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
        "data-progress",
        progress
      );
      $("#ItemProgressOrderID" + orderId + "ItemID" + itemId).attr(
        "style",
        "background:  rgba(var(--vs-" +
          this.getStatusColor(progress) +
          "),1)!important;"
      );
      //TODO:Change hover color as well

      //replace with API call
      $(
        "#ItemProgressOrderID" +
          orderId +
          "ItemID" +
          itemId +
          " .vs-button--text"
      ).text(this.getMenuItemStatus(progress));

      if (currentProgress < 100) {
        this.increaseItemPercentage(orderId, itemId, progress);
      }
    },
  },
  created() {
    if (this.getAuthToken() != null) {
      this.checkNoRestaurantsCreated();
      if (!moduleDataList.isRegistered) {
        this.$store.registerModule("orderList", moduleDataList);
        moduleDataList.isRegistered = true;
      }
      if (this.orders == null) this.$vs.loading();

      this.listOrders();
      var date = new Date();
      this.showFromDate = date.setDate(date.getDate() - 7);

      setInterval(() => {
        this.listOrders();
      }, 15000);
    }
  },
  mounted() {
    this.isMounted = true;
  },
  watch: {
    orders(newCount, oldCount) {
      console.log(this.orders);
      this.$vs.loading.close();
    },
  },
};
</script>

<style scoped>
.addonsSection >>> .vs-collapse-item--header {
  padding: 10px !important;
  font-size: 14px;
  font-weight: 500;
}
.con-vs-chip {
  margin-top: 17px;
}
.employeeName {
  margin-top: 0px;
}
</style>