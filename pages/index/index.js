const date = new Date()
const years = []
const months = []
const days = []
const name = "gzy"

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
    // currentDate: "2017年05月03日",
    name: name,
    currentDate: '',
    dayList: '',
    currentDayList: '',
    currentDayStates: '',  // false for nothing, true for tasks
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

    taskKeyList: '',
  },
  onLoad: function (options) {
    var currentObj = this.getCurrentDayString()
    // You grab the object of date and use it to set currentDate/currentDay/currentObj
    this.setData({
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日',
      currentDay: currentObj.getDate(),
      currentObj: currentObj
    })
    this.setSchedule(currentObj)
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
    if (currentObj.getMonth() == time.getMonth) {
      b = true;
    } else {
      b = false;
    }
    this.setData({
      // currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月' + currentObj.getDate() + '日',
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
      currentObj: currentObj,
      isCurrentMonth: b
    })
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
    var that = this                     // that stores the initial this in order to avoid accidential modification of this
    // The below 5 lines gets the number of days in the current months by a tricky way.
    // 1. Increase month by 1. 2. set the date to be 0 
    // => Become the last day of the current month, and it implies the number of days in the current month.
    var m = currentObj.getMonth() + 1
    var Y = currentObj.getFullYear()
    var d = currentObj.getDate();
    var dayString = Y + '/' + m + '/' + currentObj.getDate()
    var currentDayNum = new Date(Y, m, 0).getDate()
    var currentDayWeek = currentObj.getUTCDay() + 1   // 顯示星期幾
    var result = currentDayWeek - (d % 7 - 1);
    var firstKey = result <= 0 ? 7 + result : result;  // 計算出一號應該是星期幾

    var currentDayHaveTaskStates = []
    var currentDayList = []
    var currentDayStates = []
    var taskKeyList = []
    var f = 0
    // why condition i < 42?
    // 最多42個
    // 將1 - # of month 寫入一個array並在array的前後適度地添加空格
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
      taskKeyList[i] = 0;
    }

    that.setData({
      currentDayList: currentDayList,
      currentDayStates: currentDayStates,
      currentDayHaveTaskStates: currentDayHaveTaskStates,
      taskKeyList: taskKeyList
    })
  },
  onClick: function (e) {
    var that = this;
    var key = e.currentTarget.id;
    var s = that.data.currentDayStates
    s[key] = !s[key];
    this.setData({
      currentDayStates: s
    })
    // 依據是true的印出selected date
    var s1 = that.data.currentDayList;
    var s2 = that.data.currentDayStates;
    var cur = that.data.currentDate;
    var results = [];
    for (var i = 0; i < s1.length; i++) {
      if (s2[i]) {
        results[i] = cur.substr(0, 7) + s1[i] + "日";
        // console.log(cur.substr(0, 7) + s1[i] + "日");
      }
    }
    this.setData({
      selectedDays: results
    })
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var taskKey = ++app.globalData.taskCount;
    var that = this;
    var s = that.data.selectedDays;
    var s1 = that.data.currentDayHaveTaskStates;
    var s2 = that.data.currentDayStates;
    var s3 = that.data.taskKeyList;
    var j = 0;
    var taskArray = []
    for (var i = 0; i < s.length; i++) {
      if (s[i] != null) {
        s1[i] = true;
        s2[i] = false;
        s3[i] = taskKey;
        taskArray[j] = s[i];
        j++
      }
    }
    s = '';
    this.setData({
      isFormOpen: false,
      selectedDays: s,
      currentDayHaveTaskStates: s1,
      currentDayStates: s2,
      taskKeyList: s3,
    })

    // data storage
    var taskKeyString = taskKey + '';
    // console.log(taskKeyString);
    wx.setStorage({
      key: taskKeyString,
      data: {
        taskId: taskKeyString,
        userID: '',
        groupID: '',
        isGroupTask: e.detail.value.switch,
        importance: e.detail.value.slider,
        taskName: e.detail.value.input,
        content: e.detail.value.textarea,
        userName: name,
        selectedDays: taskArray,
      }
    })
    console.log("taskKeyList: " + s3);
  },
  formReset: function () {
    console.log('form发生了reset事件');
  },
  startAddingTask: function () {
    this.setData({
      isFormOpen: true
    })
  },
  closeAddingTask: function () {
    this.setData({
      isFormOpen: false
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
  getTasksInfo: function () {
    for (var i = 1; i <= app.globalData.taskCount; i++) {
      var taskKeyString = i + '';
      console.log(taskKeyString);
      wx.getStorage({
        key: taskKeyString,
        success: function (res) {
          console.log(res.data);
        }
      })
    }

  },
})  