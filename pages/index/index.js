// Initialization
const date = new Date()
const years = []
const months = []
const days = []
const task = ''
const colors = ["#e3a65d", "#a67abc", "#8a97e0", "#1fb9a2", "#636363", "#e44848"];
for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}
for (let i = 1; i <= 12; i++) {
  months.push(i)
}
for (let i = 1; i <= 31; i++) {
  days.push(i)
}

var app = getApp();
Page({
  data: {
    name: '',
    userID: '',
    userInfo: '',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    currentDate: '',
    dayList: '',
    currentDayList: '',
    currentDayStates: '',
    currentDayHaveTaskStates: '',
    currentObj: '',
    currentDay: '',
    isCurrentMonth: true,
    isFormOpen: false,
    selectedDays: '',

    years: years,
    year: date.getFullYear(),
    months: months,
    month: 2,
    days: days,
    day: 2,
    value: [9999, 1, 1],

    taskKeyList: [],
    taskKeyListSize: [],
    showModalStatus: false,

    // temp 
    tempTaskID: [],
    tempTaskName: [],
    tempTaskContent: [],
    tempUserName: [],
    tempSelectedDays: [],

    // completed
    completedTaskItems: [],
    completedTaskBackToProcessingTaskID: [],
    showCompletedTasks: false,
    showCompletedTasksSecondlayer: false,
    noCompletedTask: true,

    tempSliderValue: 0,
    tempColor: "#e3a65d",
    isTempGroup: false,
    showShareMessage: false,
    sendTask: '',
    receiveTask: '',

    showReceiveTask: false,
    showCompleteWarning: false,
    showProcessingWarning: false,
    showModifiedWarning: false,
  },
  onLoad: function (options) {
    // parse and store the data sent by the sharer
    this.getInviteCode(options);
    wx.getStorage({
      key: 'taskCount',
      success: function(res) {
        app.globalData.taskCount = res.data
      },
    })
    var currentObj = this.getCurrentDayString()
    this.setData({
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日',
      currentDay: currentObj.getDate(),
      currentObj: currentObj
    })
    this.setSchedule(currentObj)
    this.setUserInfo()
    wx.hideShareMenu();
  },
  onShareAppMessage: function (res) {
    var id = res.target.id;
    var taskKey = this.data.tempTaskID[id];
    var taskKeyString = taskKey + '';
    var task = wx.getStorageSync(taskKeyString);
    var groupID = '';
    var myDate = new Date();
    var time = myDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数)
    groupID = this.data.userInfo.nickName + time + '';
    var temp = Object.assign({}, task);
    if (res.target.dataset.sharetype == "complete") {
      temp.status = "completed";
      wx.setStorageSync(taskKeyString, temp);
    }
    if (temp.groupID == "") {
      temp.groupID = groupID;
      wx.setStorageSync(taskKeyString, temp);
    }
    this.setData({
      sendTask: temp,
      showShareMessage: false,
      isTempGroup: true,
    })
    var title = this.data.userInfo.nickName + "向您分享了一个任务";
    return {
      title: title,
      path: '/pages/index/index?sendTask=' + JSON.stringify(this.data.sendTask) + "&uname=" + this.data.userInfo.nickName,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
    }
  },
  getInviteCode: function (options) {
    if (options.sendTask != undefined) {
      this.setData({
        receiveTask: JSON.parse(options.sendTask),
      })
      wx.showToast({
        title: options.uname + "分享了任务",
        icon: 'success',
        duration: 2000
      })

    } else {
      wx.showToast({
        title: '',
        icon: 'none',
        duration: 10
      })
    }
    if (this.data.receiveTask != '') {
      this.showReceiveTask();
    }
  },
  doDay: function (e) {
    var that = this
    var currentObj = that.data.currentObj
    var Y = currentObj.getFullYear();
    var m = currentObj.getMonth() + 1;
    var d = currentObj.getDate();
    var str = ''
    if (e.currentTarget.dataset.key == 'left') {
      m -= 1
      if (m <= 0) {
        str = (Y - 1) + '/' + 12 + '/' + d
      } else {
        str = Y + '/' + m + '/' + d
      }
    } else {
      m += 1
      if (m <= 12) {
        str = Y + '/' + m + '/' + d
      } else {
        str = (Y + 1) + '/' + 1 + '/' + d
      }
    }
    currentObj = new Date(str)
    var time = new Date();
    var b;
    if (currentObj.getMonth() == time.getMonth()) {
      b = true;
    } else {
      b = false;
    }
    if (b) {
      this.setData({
        currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + time.getDate() + '日',
        currentObj: currentObj,
        isCurrentMonth: b
      })
    }
    else {
      this.setData({
        currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
        currentObj: currentObj,
        isCurrentMonth: b
      })
    }
    this.setSchedule(currentObj);
  },
  getCurrentDayString: function () {
    var objDate = this.data.currentObj
    if (objDate != '') {
      return objDate
    } else {
      var c_obj = new Date()
      var a = c_obj.getFullYear() + '/' + (c_obj.getMonth() + 1) + '/' + c_obj.getDate()
      return new Date(a)
    }
  },
  setSchedule: function (currentObj) {
    var that = this
    var m = currentObj.getMonth() + 1
    var Y = currentObj.getFullYear()
    var d = currentObj.getDate();
    var dayString = Y + '/' + m + '/' + currentObj.getDate()
    var currentDayNum = new Date(Y, m, 0).getDate()
    var currentDayWeek = currentObj.getUTCDay() + 1   // 显示星期几
    var result = currentDayWeek - (d % 7 - 1);
    var firstKey = result <= 0 ? 7 + result : result; // 计算出一号应该是星期几

    var currentDayHaveTaskStates = []
    var currentDayList = []
    var currentDayStates = []
    var taskKeyList = []
    var taskKeyListSize = []
    var f = 0
    // 最多42个
    // 将1 - # of month 写入一个array并在array的前后适度地添加空格
    for (var i = 0; i < 42; i++) {
      let data = []
      if (i < firstKey - 1) {
        currentDayList[i] = ''
      } else {
        if (f < currentDayNum) {
          currentDayList[i] = f + 1
          f = currentDayList[i]
        } else if (f >= currentDayNum) {
          currentDayList[i] = ''
        }
      }
      currentDayStates[i] = false;
      currentDayHaveTaskStates[i] = false;
      taskKeyList[i] = [];
      taskKeyListSize[i] = 0;
    }
    that.setData({
      currentDayList: currentDayList,
      currentDayStates: currentDayStates,
      currentDayHaveTaskStates: currentDayHaveTaskStates,
      taskKeyList: taskKeyList,
      taskKeyListSize: taskKeyListSize
    })
    this.modifyDayStates();
    this.modifyDayHaveTaskStates();
  },
  onClick: function (e) {
    var that = this;
    var key = e.currentTarget.id;
    var s3 = that.data.currentDayHaveTaskStates;
    var s4 = that.data.taskKeyList;
    var s5 = that.data.taskKeyListSize;

    if (this.data.isFormOpen) {
      var s = that.data.currentDayStates
      var s1 = that.data.currentDayList;
      var cur = that.data.currentDate;
      if (s1[key] != "") {
        if (!s[key]) {
          s[key] = !s[key];
          this.setData({
            currentDayStates: s
          })
          // day
          var day = s1[key];

          // month
          var month;
          if (cur.substr(6, 1) == '月') {
            month = cur.substr(5, 1);
          } else {
            month = cur.substr(5, 2);
          }
          // year
          var year = cur.substr(0, 4);

          app.globalData.selectedDays[app.globalData.selectedDaysSize++] = {
            month: month,
            year: year,
            day: day,
            key: key,
          };
          app.globalData.selectedDays.sort(function (a, b) {
            if (a.year < b.year)
              return -1;
            else if (a.year > b.year)
              return 1;
            else {
              if (a.month < b.month)
                return - 1;
              else if (a.month > b.month)
                return 1;
              else {
                if (a.day < b.day)
                  return - 1;
                else if (a.day > b.day)
                  return 1;
              }
            }
          });
        } else {
          s[key] = !s[key];
          this.setData({
            currentDayStates: s
          })
          var day = s1[key];

          // month
          var month;
          if (cur.substr(6, 1) == '月') {
            month = cur.substr(5, 1);
          } else {
            month = cur.substr(5, 2);
          }
          // year
          var year = cur.substr(0, 4);
          for (var i = app.globalData.selectedDaysSize - 1; i >= 0; i--) {
            let selectedDay = app.globalData.selectedDays[i];
            if (selectedDay.year == year && selectedDay.month == month && selectedDay.day == day) {
              app.globalData.selectedDays.splice(i, 1);
              app.globalData.selectedDaysSize--;
            }
          }
        }


      }
      var results = [];
      for (var i = 0; i < app.globalData.selectedDaysSize; i++) {
        let selectedDay = app.globalData.selectedDays[i];
        results[i] = selectedDay.year + "年" + selectedDay.month + "月" + selectedDay.day + "日";
      }
      this.setData({
        selectedDays: results
      })

    } else if (s3[key]) {
      // if click on the day having tasks, show the tasks
      this.getToTask(s4[key], s5[key]);
    } else {
      wx.showToast({
        title: "该日期无任务, 请点击下方'增加任务'",
        icon: 'none',
        duration: 1000
      })
    }

  },
  formSubmit: function (e) {
    if (e.detail.target.dataset.submittype == 'save') {
      var key = e.detail.target.id;
      var taskKey = this.data.tempTaskID[key];
      var taskKeyString = taskKey + '';
      var task = wx.getStorageSync(taskKeyString);
      var temp = Object.assign({}, task);
      temp.taskName = e.detail.value.tempTaskName;
      temp.content = e.detail.value.tempTaskContent;
      wx.setStorageSync(taskKeyString, temp);
      this.setData({
        showModalStatus: false,
      })

    } else if (e.detail.target.dataset.submittype == 'returnToProcessing') {
      if (e.detail.value.checkbox.length == 0) {
        wx.showToast({
          title: '请至少选择一个任务',
          icon: 'none',
          duration: 1000
        })
      } else {
        var completedTaskBackToProcessingTaskID = [];
        for (var i = 0; i < e.detail.value.checkbox.length; i++) {
          var taskKey = e.detail.value.checkbox[i];
          var taskKeyString = taskKey + '';
          var value = wx.getStorageSync(taskKeyString)
          var singleTaskItem = {
            taskID: '',
            taskName: '',
            selectedDays: '',
          };
          singleTaskItem.taskID = value.taskID;
          singleTaskItem.taskName = value.taskName;
          singleTaskItem.selectedDays = value.selectedDays;
          completedTaskBackToProcessingTaskID.push(singleTaskItem);
        }
        this.setData({
          completedTaskBackToProcessingTaskID: completedTaskBackToProcessingTaskID,
          showCompletedTasksSecondlayer: true,
        })
      }
    } else {
      if (e.detail.value.input == "") {
        wx.showToast({
          title: '请填写任务名',
          icon: 'none',
          duration: 1000
        })
      } else if (app.globalData.selectedDaysSize == 0) {
        wx.showToast({
          title: '请至少选择一天',
          icon: 'none',
          duration: 1000
        })
      } else {
        var taskKey = ++app.globalData.taskCount;
        wx.setStorage({
          key: 'taskCount',
          data: app.globalData.taskCount,
        })
        var that = this;
        var s = that.data.selectedDays;
        var s1 = that.data.currentDayHaveTaskStates;
        var s2 = that.data.currentDayStates;
        var s3 = that.data.taskKeyList;
        var s4 = that.data.taskKeyListSize;
        var j = 0;
        var empty;
        // var taskArray = []
        if (s.length == 0) {
          empty = true;
        } else {
          empty = false;
        }
        for (var i = 0; i < s2.length; i++) {
          s2[i] = false;
        }
        var that = this;
        var cur = this.data.currentDate;

        for (var i = 0; i < app.globalData.selectedDaysSize; i++) {
          let selectedDay = app.globalData.selectedDays[i];
          var m = selectedDay.month;
          // current month
          var cm
          if (cur.substr(6, 1) == '月') {
            cm = cur.substr(5, 1);
          } else {
            cm = cur.substr(5, 2);
          }
          if (m == cm) {
            s1[selectedDay.key] = true;
            s3[selectedDay.key][s4[selectedDay.key]] = taskKey;
            s4[selectedDay.key]++;
          }
        }

        s = '';
        this.setData({
          isFormOpen: false,
          selectedDays: s,
          currentDayHaveTaskStates: s1,
          currentDayStates: s2,
          taskKeyList: s3,
          taskKeyListSize: s4,
        })
        if (!empty) {
          // data storage
          var taskKeyString = taskKey + '';
          wx.setStorage({
            key: taskKeyString,
            data: {
              taskID: taskKeyString,
              userID: '',
              groupID: '',
              isGroupTask: e.detail.value.switch,
              importance: e.detail.value.slider,
              taskName: e.detail.value.input,
              content: e.detail.value.textarea,
              userName: this.data.userInfo.nickName,
              selectedDays: app.globalData.selectedDays,
              status: 'processing',
            }
          })

          app.globalData.selectedDays = [];
          app.globalData.selectedDaysSize = 0;
        }
        else {
          app.globalData.taskCount--;
          wx.setStorage({
            key: 'taskCount',
            data: app.globalData.taskCount,
          })
        }
      }
    }
  },
  formReset: function () {

  },
  startAddingTask: function () {
    this.setData({
      isFormOpen: true
    })
  },
  closeAddingTask: function () {
    var that = this;
    var cur = this.data.currentDate;
    var s = that.data.currentDayStates;
    for (var i = 0; i < app.globalData.selectedDaysSize; i++) {
      let selectedDay = app.globalData.selectedDays[i];
      var m = selectedDay.month;
      // current month
      var cm
      if (cur.substr(6, 1) == '月') {
        cm = cur.substr(5, 1);
      } else {
        cm = cur.substr(5, 2);
      }
      if (m == cm) {
        s[selectedDay.key] = false;
      }
    }
    app.globalData.selectedDays = [];
    app.globalData.selectedDaysSize = 0;
    this.setData({
      currentDayStates: s,
      isFormOpen: false,
      selectedDays: '',
    })
  },
  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  getToTask: function (keyList, keyListSize) {
    var that = this;
    var s1 = [];
    var s2 = [];
    var s3 = [];
    var s4 = [];
    var s5 = [];

    var index = 0;
    for (; index < keyListSize; index++) {
      var key = keyList[index];
      var taskKeyString = key + '';
      var task = wx.getStorageSync(taskKeyString);
      var days = [];
      for (var i = 0; i < task.selectedDays.length; i++) {
        days[i] = task.selectedDays[i].year + "/" + task.selectedDays[i].month + "/" + task.selectedDays[i].day;
      }
      s1[index] = task.taskID;
      s2[index] = task.taskName;
      s3[index] = task.content;
      s4[index] = task.userName;
      s5[index] = days;
    }
    this.setData({
      tempTaskID: s1,
      tempTaskName: s2,
      tempTaskContent: s3,
      tempUserName: s4,
      tempSelectedDays: s5,
      showModalStatus: true,
    })
  },
  closeTask: function () {
    this.setData({
      showModalStatus: false,
      isTempGroup: false,
    })
  },
  modifyDayStates: function () {
    var that = this;
    var cur = this.data.currentDate;
    var s = that.data.currentDayStates;
    for (var i = 0; i < app.globalData.selectedDaysSize; i++) {
      let selectedDay = app.globalData.selectedDays[i];
      var m = selectedDay.month;
      // current month
      var cm
      if (cur.substr(6, 1) == '月') {
        cm = cur.substr(5, 1);
      } else {
        cm = cur.substr(5, 2);
      }
      if (m == cm) {
        s[selectedDay.key] = true;
      }
    }
    this.setData({
      currentDayStates: s,
    })
  },
  modifyDayHaveTaskStates: function () {
    var that = this;
    var cur = this.data.currentDate;
    var s = that.data.currentDayHaveTaskStates;
    var s1 = that.data.taskKeyList;
    var s2 = that.data.taskKeyListSize;
    for (var i = 1; i <= app.globalData.taskCount; i++) {
      var taskKeyString = i + '';
      var task = wx.getStorageSync(taskKeyString);
      var days = task.selectedDays;

      for (var j = 0; j < days.length; j++) {
        var y = days[j].year;
        var m = days[j].month;
        // current month
        var cm;
        var cy = cur.substring(0,4);
        if (cur.substr(6, 1) == '月') {
          cm = cur.substr(5, 1);
        } else {
          cm = cur.substr(5, 2);
        }
        if (m == cm && y == cy) {
          if (task.status != 'completed') {
            s[days[j].key] = true;
            s1[days[j].key][s2[days[j].key]] = i;
            s2[days[j].key]++;
          }
        }
      }

    }
    this.setData({
      currentDayHaveTaskStates: s,
      taskKeyList: s1,
      taskKeyListSize: s2,
    })
  },
  setTaskComplete: function (e) {
    var id = e.currentTarget.id;
    var taskKey = this.data.tempTaskID[id];

    var taskKeyString = taskKey + '';
    var task = wx.getStorageSync(taskKeyString);
    var temp = Object.assign({}, task)
    temp.status = 'completed';
    wx.setStorageSync(taskKeyString, temp);
    this.setData({
      showModalStatus: false,
    })

    var that = this;
    var currentDayHaveTaskStates = []
    var currentDayStates = []
    var taskKeyList = []
    var taskKeyListSize = []
    for (var i = 0; i < 42; i++) {
      currentDayStates[i] = false;
      currentDayHaveTaskStates[i] = false;
      taskKeyList[i] = [];
      taskKeyListSize[i] = 0;
    }
    that.setData({
      currentDayStates: currentDayStates,
      currentDayHaveTaskStates: currentDayHaveTaskStates,
      taskKeyList: taskKeyList,
      taskKeyListSize: taskKeyListSize
    })

    this.modifyDayHaveTaskStates();
  },
  setUserInfo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 处理非同步回调(async callback)
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      name: e.detail.userInfo.nickName,
      hasUserInfo: true
    })
  },
  closeShareMsg: function () {
    this.setData({
      showShareMessage: false,
      isTempGroup: false,
    })
  },
  showReceiveTask: function () {
    if (this.data.receiveTask != '') {
      if (this.data.receiveTask.status == "completed") {
        this.setData({
          showCompleteWarning: true,
          showProcessingWarning: false
        })
      } else if (this.data.receiveTask.status == "processing") {
        var receiveTask = this.data.receiveTask;
        var found = false;
        var foundKey;
        for (var i = 1; i <= app.globalData.taskCount; i++) {
          var key = i;
          var taskKeyString = key + '';
          var task = wx.getStorageSync(taskKeyString);
          if (task.groupID == receiveTask.groupID) {
            found = true;
            foundKey = i;
            break;
          }
        }
        if (found) {
          this.setData({
            showCompleteWarning: false,
            showProcessingWarning: false,
            showModifiedWarning: true,
          })
        }
        else {
          this.setData({
            showCompleteWarning: false,
            showProcessingWarning: true,
            showModifiedWarning: false,
          })
        }
      }
      this.setData({
        showReceiveTask: true
      })
    }
  },
  modifyAndStoreReceiveTask: function () {
    var receiveTask = this.data.receiveTask;
    var found = false;
    var foundKey;
    for (var i = 1; i <= app.globalData.taskCount; i++) {
      var key = i;
      var taskKeyString = key + '';
      var task = wx.getStorageSync(taskKeyString);
      if (task.groupID == receiveTask.groupID) {
        found = true;
        foundKey = i;
        break;
      }
    }
    if (!found) {
      var taskKey = ++app.globalData.taskCount;
      wx.setStorage({
        key: 'taskCount',
        data: app.globalData.taskCount,
      })
      var that = this;
      var s = that.data.selectedDays;
      var s1 = that.data.currentDayHaveTaskStates;
      var s2 = that.data.currentDayStates;
      var s3 = that.data.taskKeyList;
      var s4 = that.data.taskKeyListSize;
      var j = 0;

      for (var i = 0; i < s2.length; i++) {
        s2[i] = false;
      }
      var that = this;
      var cur = this.data.currentDate;

      for (var i = 0; i < receiveTask.selectedDays.length; i++) {
        let selectedDay = receiveTask.selectedDays[i];
        var m = selectedDay.month;
        // current month
        var cm;
        if (cur.substr(6, 1) == '月') {
          cm = cur.substr(5, 1);
        } else {
          cm = cur.substr(5, 2);
        }
        if (m == cm) {
          s1[selectedDay.key] = true;
          s3[selectedDay.key][s4[selectedDay.key]] = taskKey;
          s4[selectedDay.key]++;
        }
      }

      s = '';
      this.setData({
        isFormOpen: false,
        selectedDays: s,
        currentDayHaveTaskStates: s1,
        currentDayStates: s2,
        taskKeyList: s3,
        taskKeyListSize: s4,
      })
      // data storage
      var taskKeyString = taskKey + '';
      wx.setStorage({
        key: taskKeyString,
        data: {
          taskID: taskKeyString,
          userID: '',
          groupID: receiveTask.groupID,
          isGroupTask: receiveTask.isGroupTask,
          importance: receiveTask.importance,
          taskName: receiveTask.taskName,
          content: receiveTask.content,
          userName: this.data.userInfo.nickName,
          selectedDays: receiveTask.selectedDays,
          status: receiveTask.status,
        }
      })
    }
    else {
      var foundKeyString = foundKey + '';
      var task = wx.getStorageSync(taskKeyString);
      var temp = Object.assign({}, task)
      temp.status = receiveTask.status;
      temp.importance = receiveTask.importance,
        temp.taskName = receiveTask.taskName,
        temp.content = receiveTask.content,
        temp.selectedDays = receiveTask.selectedDays,
        wx.setStorageSync(taskKeyString, temp);
      var that = this;
      var currentDayHaveTaskStates = []
      var currentDayStates = []
      var taskKeyList = []
      var taskKeyListSize = []
      for (var i = 0; i < 42; i++) {
        currentDayStates[i] = false;
        currentDayHaveTaskStates[i] = false;
        taskKeyList[i] = [];
        taskKeyListSize[i] = 0;
      }
      that.setData({
        currentDayStates: currentDayStates,
        currentDayHaveTaskStates: currentDayHaveTaskStates,
        taskKeyList: taskKeyList,
        taskKeyListSize: taskKeyListSize
      })

      this.modifyDayHaveTaskStates();
    }
  },
  closeReceiveTask: function () {
    this.setData({
      showReceiveTask: false,
    })
  },
  acceptReceiveTask: function () {
    this.modifyAndStoreReceiveTask();
    this.setData({
      showReceiveTask: false,
    })
  },
  rejectReceiveTask: function () {
    this.setData({
      showReceiveTask: false,
    })
  },
  sliderChange: function (e) {
    var value = e.detail.value;
    var currentValue = this.data.tempSliderValue;
    if (value != currentValue) {
      // modify the value
      let color = colors[value];
      this.setData({
        tempSliderValue: value,
        tempColor: color,
      })
    }
  },
  showCompletedTasks: function () {
    if (app.globalData.taskCount == 0) {
      // no completed task
    } else {

      var completedTaskItems = [];
      for (var i = 1; i <= app.globalData.taskCount; i++) {
        var taskKeyString = i + '';
        try {
          var value = wx.getStorageSync(taskKeyString)
          if (value) {
            if (value.status == 'completed') {
              var singleTaskItem = {
                taskID: '',
                taskName: '',
                selectedDays: '',
              };
              singleTaskItem.taskID = value.taskID;
              singleTaskItem.taskName = value.taskName;
              singleTaskItem.selectedDays = value.selectedDays;
              completedTaskItems.push(singleTaskItem);
            }
          }
        } catch (e) {
          console.log('there is no such stored data with the key ' + taskKeyString);
          console.log('error message: ' + e);
        }
      }
      this.setData({
        completedTaskItems: completedTaskItems,
      })
    }
    this.setData({
      showCompletedTasks: true,
    })
    var isanycompleted = this.checkanycompleted();
    if (!isanycompleted) {
      this.setData({
        noCompletedTask: true,
      })
    } else {
      this.setData({
        noCompletedTask: false,
      })
    }
  },
  closeCompletedTasks: function () {
    this.setData({
      showCompletedTasks: false,
    })
  },
  closeCompletedTasksSecond: function () {
    this.setData({
      showCompletedTasksSecondlayer: false,
    })
  },
  changeStatusBackToProcessing: function () {
    for (var i = 0; i < this.data.completedTaskBackToProcessingTaskID.length; i++) {
      var taskKey = this.data.completedTaskBackToProcessingTaskID[i].taskID;
      var taskKeyString = taskKey + '';
      var task = wx.getStorageSync(taskKeyString);
      var temp = Object.assign({}, task)
      temp.status = 'processing';
      wx.setStorageSync(taskKeyString, temp);
    }
    var that = this;
    var currentDayHaveTaskStates = []
    var currentDayStates = []
    var taskKeyList = []
    var taskKeyListSize = []
    for (var i = 0; i < 42; i++) {
      currentDayStates[i] = false;
      currentDayHaveTaskStates[i] = false;
      taskKeyList[i] = [];
      taskKeyListSize[i] = 0;
    }
    that.setData({
      currentDayStates: currentDayStates,
      currentDayHaveTaskStates: currentDayHaveTaskStates,
      taskKeyList: taskKeyList,
      taskKeyListSize: taskKeyListSize
    })

    this.modifyDayHaveTaskStates();
    this.setData({
      showCompletedTasks: false,
      showCompletedTasksSecondlayer: false,
    })
  },
  checkanycompleted: function () {
    var isAnyTaskCompleted = false;
    // return true if there is any task whose status is 'completed'
    for (var i = 1; i <= app.globalData.taskCount; i++) {
      var taskKeyString = i + '';
      var task = wx.getStorageSync(taskKeyString);
      var temp = Object.assign({}, task)
      if (temp.status == 'completed') {
        isAnyTaskCompleted = true;
        break;
      }
    }
    return isAnyTaskCompleted;
  }
})