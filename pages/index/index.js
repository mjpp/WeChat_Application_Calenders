const date = new Date()
const years = []
const months = []
const days = []
const name = "gzy"
const task = ''

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
    showModalStatus: false,

    // temp 
    tempTaskID: '',
    tempTaskName: '',
    tempTaskContent: '',
    tempUserName: '',
    tempSelectedDays: ','
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

    this.modifyDayStates();
    this.modifyDayHaveTaskStates();
  },
  onClick: function (e) {
    var that = this;
    var key = e.currentTarget.id;
    var s3 = that.data.currentDayHaveTaskStates;
    var s4 = that.data.taskKeyList;

    if (this.data.isFormOpen) {
      // toggle green
      // var s = that.data.currentDayStates
      // s[key] = !s[key];
      // this.setData({
      //   currentDayStates: s
      // })
      // // travse currentDayStates and store selectedDays
      // var s1 = that.data.currentDayList;
      // var s2 = that.data.currentDayStates;
      // var cur = that.data.currentDate;
      // var results = [];
      // for (var i = 0; i < s1.length; i++) {
      //   if (s2[i]) {
      //     results[i] = cur.substr(0, 7) + s1[i] + "日";
      //     // console.log(cur.substr(0, 7) + s1[i] + "日");
      //     app.globalData.selectedDays[app.globalData.selectedDays.length] = results[i];
      //     console.log(app.globalData.selectedDays);
      //   }
      // }
      // this.setData({
      //   selectedDays: results
      // })
      var s = that.data.currentDayStates
      var s1 = that.data.currentDayList;
      var cur = that.data.currentDate;
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
        console.log(app.globalData.selectedDays);
      } else {
        // delete
        // 1. become black
        s[key] = !s[key];
        this.setData({
          currentDayStates: s
        })
        // 2. delete item in the selectedDays
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
        // 3. decrease app.globalData.selectedDaysSize
        for (var i = app.globalData.selectedDaysSize - 1; i >= 0; i--) {
          let selectedDay = app.globalData.selectedDays[i];
          if (selectedDay.year == year && selectedDay.month == month && selectedDay.day == day) {
            app.globalData.selectedDays.splice(i, 1);
            app.globalData.selectedDaysSize--;
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
      // yellow, if click on the day have tasks, show the tasks
      this.getToTask(s4[key]);
    }

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
        s3[selectedDay.key] = taskKey;
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
    if (!empty) {
      // data storage
      var taskKeyString = taskKey + '';
      // console.log(taskKeyString);
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
          userName: name,
          selectedDays: app.globalData.selectedDays,
        }
      })

      app.globalData.selectedDays = [];
      app.globalData.selectedDaysSize = 0;
      // console.log("taskKeyList: " + s3);
    }
    else {
      app.globalData.taskCount--;
    }
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
    // this.setData({
    //   currentDayStates: s,
    // })
    // var that = this;
    // var s = that.data.selectedDays;
    // var s2 = that.data.currentDayStates;
    // // 同一個月
    // // 用key
    // // purpose toggle green
    // for (var i = 0; i < s.length; i++) {
    //   if (s[i] != null) {
    //     s2[i] = false;
    //   }
    // // }
    // s = '';
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
  getToTask: function (key) {
    var taskKeyString = key + '';
    var task = wx.getStorageSync(taskKeyString);
    var days = [];
    for (var i = 0; i < task.selectedDays.length; i++) {
      days[i] = task.selectedDays[i].year + "/" + task.selectedDays[i].month + "/" + task.selectedDays[i].day;
    }
    console.log(task);
    this.setData({
      tempTaskID: task.taskID,
      tempTaskName: task.taskName,
      tempTaskContent: task.content,
      tempUserName: task.userName,
      tempSelectedDays: days,
      showModalStatus: true,
    })
  },
  closeTask: function () {
    this.setData({
      showModalStatus: false,
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;

    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({
        animationData: animation
      })

      //关闭  
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示  
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
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
    for (var i = 1; i <= app.globalData.taskCount; i++) {
      var taskKeyString = i + '';
      var task = wx.getStorageSync(taskKeyString);
      var days = task.selectedDays;
      for (var j = 0; j < days.length; j++) {
        var m = days[j].month;
        // current month
        var cm;
        if (cur.substr(6, 1) == '月') {
          cm = cur.substr(5, 1);
        } else {
          cm = cur.substr(5, 2);
        }
        if (m == cm) {
          s[days[j].key] = true;
          s1[days[j].key] = i;
        }
      }
    }
    this.setData({
      currentDayHaveTaskStates: s,
      taskKeyList: s1,
    })
  }
})  