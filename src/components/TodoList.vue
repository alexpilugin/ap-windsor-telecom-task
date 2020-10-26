<template>
  <v-container v-show="!!todos">
    <v-row class="text-left">
      <v-col cols="12">
        <v-card>
          <v-toolbar color="#1876d1" dark>
            <v-card-title class="layout">
              <div><h3 class="title text-sm-left">To-Do List</h3></div>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-form align="center" justify="center">
              <v-container fill-height>
                <v-layout row wrap align-center>
                  <v-text-field
                    v-model="searchText"
                    placeholder="Search"
                    outlined
                    dense
                    clearable
                  >
                    <v-icon slot="append">mdi-magnify</v-icon>
                  </v-text-field>
                </v-layout>
              </v-container>
            </v-form>
            <v-dialog v-model="showAddNewDialog" persistent max-width="600px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  small
                  fab
                  dark
                  color="green"
                  class="ml-5"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title dark class="headline green white--text">
                  Add New Record
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="userId"
                          label="User Id"
                          type="number"
                          min="1"
                          value="1"
                          required
                          :rules="userIdRules"
                          prepend-inner-icon="mdi-account"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-checkbox
                          v-model="newRecord.completed"
                          label="Completed"
                          color="success"
                          hide-details
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12"> 
                        <v-text-field
                          v-model="recTitle"
                          label="Title"
                          required
                          :rules="titleRules"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="cancelNew()">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="addNew()">
                    Append
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
          <v-container fluid class="pt-0">
            <v-row justify="space-between">
              <v-col xs12>
                <DataTable :values="todos" :search="searchText" />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import DataTable from "@/components/DataTable.vue";

export default {
  name: "todo-list",
  components: {
    DataTable,
  },
  data() {
    return {
      searchText: "",
      showAddNewDialog: false,
      newRecord: {
        completed: false,
        id: undefined,
        userId: undefined,
        title: "",
      },
      userIdRules: [
        (v) => !!v || "This field is required",
        (v) => (v && v > 0) || "UserId should be above 0",
      ],
      titleRules: [
        (v) => !!v || "This field is required",
        v => (v && v.length > 5) || 'Title must have 5+ characters'  
      ]
    };
  },
  computed: {
    ...mapState({
      todos: (state) => state.todos,
    }),
    ...mapGetters({
      getListOfUsers: "getListOfUsers",
      getTodosByUserId: "getTodosByUserId",
      getTodosByStatus: "getTodosByStatus",
    }),
    userId: {
      get: function () {
        return this.newRecord.userId;
      },
      set: function (v) {
        const n = parseInt(v, 10);
        this.newRecord.userId = n < 1 ? 1 : n;
      },
    },
    recTitle: {
      get: function () {
        return this.newRecord.title;
      },
      set: function (v) {
        this.newRecord.title = v;
      },
    }
  },
  methods: {
    ...mapActions({
      addRecord: "addRecord",
    }),
    addNew() {
      if (this.newRecord.userId && this.newRecord.title.length > 5){
        const recWithMaxId = this.todos.reduce((prev, current) => (parseInt(prev.id, 10) > parseInt(current.id, 10)) ? prev : current);
        let record = this.newRecord;
        record.id = parseInt(recWithMaxId.id, 10) + 1;
        this.addRecord(record);
        this.showAddNewDialog = false;
        this.$nextTick( this.resetNewRecord() );
      } 
    },
    cancelNew() {
      this.resetNewRecord();
      this.showAddNewDialog = false;
    },
    resetNewRecord() {
      this.newRecord = {
        completed: false,
        id: undefined,
        userId: undefined,
        title: "",
      };
    },
    incrementUserId() {
      this.newRecord.userId = parseInt(this.newRecord.userId, 10) + 1;
    },
    decrementUserId() {
      this.newRecord.userId = parseInt(this.newRecord.userId, 10) - 1;
    },
  },
};
</script>

<style scoped>
.list-column {
  float: left;
}
.v-text-field.v-text-field--enclosed {
  margin-top: 25px !important;
}
</style>