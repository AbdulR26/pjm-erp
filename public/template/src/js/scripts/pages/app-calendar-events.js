'use strict';

var date = new Date();
var nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
  initialView: 'dayGridMonth',
  selectable: true,
  events: '/kaldik/events',
  eventClick: function(info) {
    console.log(info.event);
  }
});

calendar.render();
