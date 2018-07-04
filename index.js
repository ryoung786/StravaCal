var strava = require('strava-v3');
var dateFormat = require('dateformat');
const CalendarAPI = require('node-google-calendar');

function summary(meters, seconds) {
    var miles = (meters * 0.000621371).toFixed(1);
    return "✔ " + miles + "M at " + pace(meters, seconds) + " pace";
}
function sec2minsec(seconds) {
    var hours = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor((seconds % 3600) % 60);

    return (hours > 0 ? hours + ":" : '')
  + mins + ":" + (secs < 10 ? "0"+secs : secs);
}
function pace(meters, seconds) {
    var miles = (meters * 0.000621371).toFixed(1);
    var sec_per_mile = seconds / miles;
    return sec2minsec(sec_per_mile);
}

function description(activity) {
    var laps = "";
    if (activity.laps && activity.laps.length > 0) {
    laps = "\n";
    for (var i=0; i<activity.laps.length; i++) {
      var lap = activity.laps[i];
      laps += lap.name + ": " + sec2minsec(lap.elapsed_time) + "\n";
    }
    }

    var name = activity.name + "\n";
    var desc = (activity.description && activity.description != 'null')
    ? activity.description + "\n\n" : '';

    var distance = "Distance: " + (activity.distance * 0.000621371).toFixed(1)
    + " miles\n";
    var elapsed_time = "Total time: "
    + sec2minsec(activity.moving_time) + "\n";
  
    var cadence = activity.average_cadence ?
    ("Avg cadence: " 
       + (activity.average_cadence * 2).toFixed(0) 
       + " spm\n") : '';
    var heartrate = activity.has_heartrate ?
    ("Avg heartrate: " 
       + activity.average_heartrate + " bpm\n") : '';

    var link = "https://www.strava.com/activities/" + activity.id + "\n\n";
    return name + link + desc + distance + elapsed_time
        + cadence + heartrate + laps;
}

function toDate(time) {
    return dateFormat(time, "yyyy-mm-dd");
}

function nextDate(date) {
    var result = new Date(date);
    result.setDate(result.getDate() + 1);
    return result;
}

const CONFIG = {
    serviceAcctId: "stravacal-service@stravacal.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC47rur5Fn38cVK\nrag96Qb6phvlU4RIjBQq90j6wqt3NIzkbpZBz0Fp6UwZgeSVJW9bOSSCcbatfgt0\nngDCzCfX9FJ5KihSPe3ZIM/hshnEVpXBTehCYNVtmGXvc046N1Y0hc/LS+R2cGQQ\nZpMM2GfVJ4RamrqvRnt1dLR8cGmWhif80/x4gREhJktOrvNB1v8y//kSTTkyUYGz\n5/bGwGhbf3CG3E0Sp0oLX4f+/2T+tP/t/OyM+7I/3r2sncjPeQR1rY0LGVgEbfld\n8gWKT6kI+eR7qtf17WqsEICQhmNwF6KOoClXelmTVOHWV2X7fCNpCNwqBH3H3IhJ\nPrjT4SJ3AgMBAAECggEALagjBUkXPTOfddRx2PcTFga0lGWOHysWP5VVmzM8ie2b\nazoyNoUorTE/7Hw5JulbGLZ+4QWaCDM6OMxZe75Th+l2Axv5YHSRqC2FpT8HRYXq\n6xKE6P5nMuuRHxDkm1LWIZl3t8VA3kzZJ4Nrgpxa5jEfaA8TT/qiuFjbxm0qZFLG\nFxIEb0Nz4exmUyPzZkfAU0CIi+HHyQRS8XjEptueTPeeRZMnxdR0zCyWSGytDUh/\nyDu9/gwlBF367HJRd0xOftROgD2TkP0yi4qRU+FByIaPrQb8fhHJvSdPlNmgX/Dv\n5t2zMQANueyTO1a9pkFAVwvTgbcfy3i9kkONYB0sgQKBgQD9QRPw4L0sIT1ouiQF\nlb6sPz3afyZehuQlZXdJfChjW7pyjgpid3hVJ0dn4iH/3ISV/TZiIFIB3y/kRmnd\n/rr0qFUwHj4NNOpMi/rMTye5J7ui8f/LDErK+LtjDtKeBCWIb02frQ+AkzxvkDhO\nOZ96ffSLLcdPpdBoTuwmc3qY8QKBgQC68AY9USM4Q9Ay5mbAMjc7C4p+EeF+68oU\nAMpSitOuidVlTWnZgLm0pMjJZGWRRw+9iEtpCxoqpFqPkSfcvWlan0pa9GL8Gl86\ngqXysIOtpwNEtWvdbg+b21BbZle7JOpyWVUJZsZBdSRThG3OtQgpMsg0KjUumSWd\nDPmIAKsx5wKBgQCTK+9vqtqkO4jZRFrMmBHfPT0vrXZZtl/8z3M71BgQbWzzR1IH\nmM/oBFR9rS7+5mJyW1zwN0IQ7meBa9338SEqLmya8ugyeo6x/yK2+kTmV422CpYQ\npEsOmu8iiKmixFwfZjcg1MxOdsHHP3NJGjlwUKP9AZRy17Q9+adITRFwsQKBgQCg\nYbvIsasY471lXh07uhl+k/k/DlI71UorfT4YMTlJ3sFxx0gQLoulO1d0yakGSkRr\n5NpmBftuKFH2KKBdlzgjYtSlUlT2XB3lkh+UJvLico6wTUJ82KeVnUTFFfog+pwW\nfSQjC8T+deUzrkOTe+fDiOkRMEEueIA3zODtWT2HcwKBgQDICajCcoXNHhu2SWat\naW++Zt3sm7Lc+wSa0kK9zzkuCDTZYtozB5Zevym3OUc1ZY5lLLe+YdkH/I2fmayw\nxwz1OKj7Z8LcZlQx8fc+ReMSnjGt973LCDEM8Je23vEqUvnSfCLuR/eYcaZBIqJI\n7Kbxf8B+gOtmleubGif1daiHoQ==\n-----END PRIVATE KEY-----\n",
    timezone: 'UTC+0:00',
    calendarId: {'marathon': '8l3km16519shkqfq96a2clnol8@group.calendar.google.com'}
};

var cal = new CalendarAPI(CONFIG);

exports.helloWorld = function helloWorld(req, res) {
  console.log("body:");
  console.log(req.body);
  var activity_id = req.body.object_id;

  strava.activities.get(
    {
    'access_token':'e577502d003aaf50ed630c3c22afeff267628a3b',
    'id': activity_id
    }, function(err,payload,limits) {
    console.log(payload);
    var name = summary(payload.distance, payload.moving_time);
      cal.Events.insert(CONFIG.calendarId.marathon, {
      'start': { 'date': toDate(payload.start_date_local) },
      'end': { 'date': toDate(nextDate(payload.start_date_local)) },
      'summary': name,
      'description': description(payload),
      'colorId': 0 // 4 is didn't do it, 0 is cal color
    }).then(resp => {
      console.log('inserted event:');
      console.log(resp);
    }).catch(err => {
      console.log("error: insertEvent-" + err);
    });
    });
  res.status(200).json({});
};

