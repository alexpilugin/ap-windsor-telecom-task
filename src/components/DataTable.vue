<template>
  <div>
    <table :class="tableClass">
      <thead v-show="!hideTitle">
        <tr>
          <th v-if="showCounter" class="index">&nbsp;</th>
          <th class="th-clickable col-id" @click="resetSorting()">
            {{ getColHeader(0) }}
          </th>
          <th class="th-clickable col-status">
            <v-menu :close-on-content-click="false" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                  <v-icon size="18">mdi-filter-menu</v-icon>
                </v-btn>
              </template>

              <v-container fluid class="pt-0">
                <v-row>
                  <v-col class="pt-0">
                    <v-checkbox
                      v-for="(status, index) in statuses"
                      v-model="selectedStatuses"
                      :key="'status' + index"
                      :label="status ? 'Yes' : 'No'"
                      :value="status"
                      hide-details
                      multiple
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-menu>
            {{ getColHeader(1) }}
          </th>
          <th class="th-clickable col-user">
            <v-menu :close-on-content-click="false" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                  <v-icon size="18">mdi-filter-menu</v-icon>
                </v-btn>
              </template>

              <v-container fluid class="pt-0">
                <v-row>
                  <v-col class="pt-0">
                    <v-checkbox
                      v-for="(user, index) in users"
                      v-model="selectedUsers"
                      :key="'user' + index"
                      :label="'' + user"
                      :value="user"
                      hide-details
                      multiple
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-menu>
            {{ getColHeader(2) }}
          </th>
          <th class="th-clickable col-title" @click="sortCol(3)">
            {{ getColHeader(3) }}
          </th>
          <th><span>Edit</span></th>
          <th><span>Remove</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in filteredRows" :key="'tr-' + index">
          <td v-if="showCounter" class="index">{{ index + 1 }}</td>
          <td>{{ getCellValue(index, 0) }}</td>
          <td>
            <v-icon v-show="getCellValue(index, 1) === true" class="icon-done"
              >mdi-check-all</v-icon
            >
          </td>
          <td>{{ getCellValue(index, 2) }}</td>
          <td v-html="highlightMatches(getCellValue(index, 3))"></td>
          <td @click="edit(index)" class="clickable">
            <v-icon color="blue">mdi-pencil</v-icon>
          </td>
          <td @click="remove(index)" class="clickable">
            <v-icon color="red">mdi-delete-forever</v-icon>
          </td>
        </tr>
      </tbody>
    </table>
    <v-dialog v-model="showEditDialog" persistent max-width="600px">
      <v-card>
        <v-card-title dark class="headline green white--text">
          Edit
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row align="center">
              <v-col cols="12" sm="2" md="2">
                <div>Id: <b>{{ editRecord.id }}</b></div>
              </v-col>
              <v-col cols="12" sm="7" md="7">
                <v-text-field
                  v-model="editRecord.userId"
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
              <v-col cols="12" sm="3" md="3">
                <v-checkbox
                  v-model="editRecord.completed"
                  label="Completed"
                  color="success"
                  hide-details
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editRecord.title"
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
          <v-btn color="blue darken-1" text @click="cancelUpdate()">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveUpdate()"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  name: "data-table",
  props: {
    values: {
      type: Array, //2d Array
      default: () => [],
      validator: (prop) => prop.every((e) => typeof e === "object"),
    },
    search: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      tableClass: "data-tbl",
      showCounter: true,
      hideTitle: false,
      colTitles: ["Id", "Completed", "UserId", "Title"],
      rows: [],
      sorted: [],
      selectedStatuses: [],
      selectedUsers: [],
      userIdRules: [
        (v) => !!v || "This field is required",
        (v) => (v && v > 0) || "UserId should be above 0",
      ],
      titleRules: [
        (v) => !!v || "This field is required",
        v => (v && v.length > 5) || 'Title must have 5+ characters'  
      ],
      showEditDialog: false,
      editRecord: {
        completed: false,
        id: undefined,
        userId: undefined,
        title: "",
      },
    };
  },
  created() {
    this.updateData();
  },
  watch: {
    values(newValues) {
      this.updateData();
      this.$forceUpdate();
    },
    search(text) {
      this.$forceUpdate();
    },
  },
  computed: {
    ...mapGetters({
      statuses: "getListOfStatuses",
      users: "getListOfUsers",
    }),
    filteredRows() {
      const searchText = this.search;
      let filtered = [...this.rows];

      if (this.selectedStatuses.length && this.selectedStatuses.length > 0) {
        const len = this.selectedStatuses.length;
        filtered = filtered.filter((record) => {
          const completed = record.completed;
          if (len == 1) return completed === this.selectedStatuses[0];
          if (len == 2) return true;
        });
      }

      if (this.selectedUsers.length && this.selectedUsers.length > 0) {
        const len = this.selectedStatuses.length;
        filtered = filtered.filter((record) => {
          return this.selectedUsers.some((user) => user === record.userId);
        });
      }

      if (!searchText) return filtered;

      filtered = filtered.filter((record) => {
        const title = record.title.toString().toLowerCase();
        return title.includes(searchText);
      });

      console.log(filtered);
      return filtered;
    },
  },
  methods: {
    ...mapActions({
      deleteRecord: "deleteRecord",
      updateRecord: "updateRecord"
    }),
    updateData() {
      this.sorted = [];
      if (this.values) {
        this.rows = [...this.values]; //.slice(); //clone
        for (var i = 0; i < this.colTitles.length; i++) {
          this.sorted.push({
            dest: false,
          });
        }
      }
    },
    getColHeader(colIndex) {
      if (this.colTitles && this.colTitles.length > 0) {
        return this.colTitles[colIndex];
      }
    },
    getCellValue(rowIndex, colIndex) {
      if (this.filteredRows && this.filteredRows.length > 0) {
        const record = this.filteredRows[rowIndex];
        //"Id", "Completed", "UserId", "title"
        if (colIndex === 0) return record.id;
        if (colIndex === 1) return record.completed;
        if (colIndex === 2) return record.userId;
        if (colIndex === 3) return record.title;
      }
    },
    remove(rowIndex) {
      const id = this.filteredRows[rowIndex].id;
      this.deleteRecord({
        id: id,
        rowIndex: rowIndex,
      });
    },
    edit(rowIndex) {
      this.editRecord = Object.assign({}, this.filteredRows[rowIndex]); //clone
      this.showEditDialog = true;
    },
    cancelUpdate() {
      this.showEditDialog = false;
    },
    saveUpdate() {
      this.updateRecord(this.editRecord);
      this.showEditDialog = false;
      this.$nextTick( this.resetEditRecord() );
    },
    resetEditRecord() {
      this.editRecord = {
        completed: false,
        id: undefined,
        userId: undefined,
        title: "",
      };
    },
    resetSorting() {
      this.updateData();
    },
    sortCol(colIndex) {
      console.log("sortCol:---------");
      if (this.rows && this.rows.length > 0) {
        this.sorted[colIndex].dest = !this.sorted[colIndex].dest;
        this.rows = this.rows.sort((a, b) => {
          if (a.title < b.title) return this.sorted[colIndex].dest ? -1 : 1;
          if (a.title > b.title) return this.sorted[colIndex].dest ? 1 : -1;
          return 0;
        });
        console.log(this.rows);
      }
    },
    highlightMatches(text) {
      const searchText = this.search;
      if (!searchText) return text;
      const matchExists = text.toLowerCase().includes(searchText.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(searchText, "ig");
      return text.replace(
        re,
        (matchedText) => `<span class="match">${matchedText}</span>`
      );
    },
  },
};
</script> 

<style>
table.data-tbl {
  border-collapse: collapse;
  table-layout: auto; /*fixed;*/
  border: 1px solid #1876d1;
  background-color: rgb(245, 245, 245) !important;
  width: 100%;
  text-align: left;
}
table.data-tbl thead {
  background: #1876d1;
}
table.data-tbl thead th {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
}
table.data-tbl thead th:first-child {
  border-left: none;
}
table.data-tbl td,
table.data-tbl th {
  /*border: 1px solid #AAAAAA;*/
  border: 3px solid white;
  padding: 3px 5px;
}
table.data-tbl tr:nth-child(even) {
  background-color: rgb(230, 230, 230) !important;
}
table.data-tbl td:nth-child(1),
table.data-tbl td:nth-child(2),
table.data-tbl td:nth-child(3),
table.data-tbl td:nth-child(6),
table.data-tbl td:nth-child(7) {
  text-align: center;
}
table.data-tbl td:nth-child(3) {
  width: 135px;
}
.th-clickable:hover {
  background: #005184; /* #1de9b6; */
  /* color: black; */
  cursor: pointer;
}
table.data-tbl .index {
  width: 70px;
}
.icon-done {
  color: #00c853 !important;
}
.edit-icon {
}
.clickable {
  cursor: pointer;
}
span.match {
  font-weight: bold;
  color: orangered;
}
.status-filter-wraper {
  position: relative;
}
.status-filter-content {
  position: absolute;
  top: 25px;
  left: 0px;
  width: auto;
  height: auto;
  background: white;
}
.v-menu__content {
  background: white;
  padding: 5px;
}
</style>