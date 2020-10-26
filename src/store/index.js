import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import {
  SET_ERROR,
  SET_LOADING,
  UPDATE_DATA,
  ADD_RECORD,
  REMOVE_RECORD,
  UPDATE_RECORD
} from './mutation-types.js';

let devMode = process.env.NODE_ENV === 'development';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    globalError: '',
    loading: false,
    todos: undefined,
    users: undefined
  },
  getters: {
    getListOfStatuses: state => {
      const todos = state.todos;
      if (todos && todos.length > 0) {
        let statuses = todos.map(record => record.completed);
        const set = new Set(statuses); //unique set 
        return [...set]; //Array.from(set)
      }
    },
    getListOfUsers: state => {
      const todos = state.todos;
      if (todos && todos.length > 0) {
        let users = todos.map(record => record.userId);
        const set = new Set(users); //unique set
        return [...set]; //Array.from(set)
      }
    },
    getTodosByUserId: state => {
      const todos = state.todos;
      function searchTodos(userId) {
        if (todos && todos.length > 0) {
          let results = todos.filter(record => record.userId == userId);
          return results;
        }
      }
      //return a closure function:
      return searchTodos;
    },
    getTodosByStatus: state => {
      const todos = state.todos;
      function searchTodos(isCompleted) {
        if (todos && todos.length > 0) {
          let results = todos.filter(record => record.completed == isCompleted);
          return results;
        }
      }
      //return a closure function:
      return searchTodos;
    },
  },
  mutations: {
    [SET_ERROR]: (state, error) => {
      state.globalError = error
    },
    [SET_LOADING]: (state, isLoading) => {
      state.loading = isLoading;
    },
    [UPDATE_DATA]: (state, payload) => {
      state.todos = payload;
    },
    [ADD_RECORD]: (state, newRecord) => {
      state.todos.push(newRecord);
    },
    [REMOVE_RECORD]: (state, recordIndex) => {
      state.todos.splice(recordIndex, 1);
    },
    [UPDATE_RECORD]: (state, record) => {
      const item = state.todos.find(item => item.id === record.id);
      Object.assign(item, record);
    }
  },
  actions: {
    logError: (context, err) => {
      if (devMode) console.log("Action: store/logError");
      context.commit(SET_ERROR, err);
    },
    stopLoading: (context) => {
      if (devMode) console.log("Action: store/stopLoading");
      context.commit(SET_LOADING, false);
    },
    startLoading: (context) => {
      if (devMode) console.log("Action: store/startLoading");
      context.commit(SET_LOADING, true);
    },
    readData: (context) => {
      if (devMode) console.log("Action: store/readData");
      context.commit(SET_LOADING, true); //mutation
      axios
        .get('https://jsonplaceholder.typicode.com/todos/')
        .then(function (response) {
          context.commit(UPDATE_DATA, response.data); //mutation
          context.dispatch("stopLoading"); //action
        })
        .catch(err => {
          console.error(err);
          context.commit(SET_ERROR, err.toString()); //mutation
          context.dispatch("stopLoading"); //action
        })
    },
    updateRecord: (context, record) => {
      if (devMode) console.log("Action: store/updateRecord");

      axios({
        method: 'put',
        url: `https://jsonplaceholder.typicode.com/todos/${record.id}`,
        data: JSON.stringify(record),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      })
        .then(function (response) {
          console.log(response);
          context.commit(UPDATE_RECORD, response.data);  //record
        })
        .catch(function (error) {
          //handle error
          console.log(error);
          context.commit(SET_ERROR, error.message);
        });
    },
    addRecord: (context, newRec) => {
      if (devMode) console.log("Action: store/addRecord");
      axios({
        method: 'post',
        url: 'https://jsonplaceholder.typicode.com/todos/',
        data: JSON.stringify(newRec),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      })
        .then(function (response) {
          //handle success
          console.log(response);
          //context.commit(ADD_RECORD, response.data); //returnd maxId == 201 <------ IMPORTANT!
          context.commit(ADD_RECORD, newRec);
        })
        .catch(function (error) {
          //handle error
          console.log(error);
          context.commit(SET_ERROR, error.message);
        });
    },
    deleteRecord: (context, { id, rowIndex }) => {
      if (devMode) console.log("Action: store/deleteRecord: id:" + id + " rowIndex: " + rowIndex);
      axios({
        method: 'delete',
        url: `https://jsonplaceholder.typicode.com/todos/${id}/`,
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      })
        .then(function (response) {
          //handle success
          context.commit(REMOVE_RECORD, rowIndex);
          console.log(response);
        })
        .catch(function (error) {
          //handle error
          console.log(error);
          context.commit(SET_ERROR, error.message);
        });
    }
  },
  modules: {
  }
})
