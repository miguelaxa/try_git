{
  "database": "test",
  "collection": "data_09.15.17",
  "pipeline": [
    {
      "$match": {
        "Status": {
          "$regex": "^In|^Co|^Rev"
        }
      }
    },
    {
      "$unwind": "$verhist.changes"
    },
    {
      "$match": {
        "verhist.user": {
          "$regex": "."
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_key": {
          "$regex": "^Sta|^Site R|^Scr|^Del|^Doc|^3|^Con|^Day"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_key": {
          "$regex": "^(?!N/A.*$).*"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_val": {
          "$regex": "^(?!Not.*$).*"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_val": {
          "$regex": "^(?!Rec.*$).*"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_val": {
          "$regex": "^(?!Need.*$).*"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_val": {
          "$regex": "^(?!Scree.*$).*"
        }
      }
    },
    {
      "$match": {
        "verhist.changes.ch_val": {
          "$regex": "^(?!Inc.*$).*"
        }
      }
    },
    {
      "$project": {
        "_id": "$ID",
        "S_ID": "$Title",
        "Partner": "$Partner",
        "Status": "$Status",
        "Sch_Date": "$isodate_sd",
        "RWeekof": "$RWeekOf",
        "V_Ver": "$verhist.ver",
        "V_User": "$verhist.user",
        "V_key": "$verhist.changes.ch_key",
        "V_Val": "$verhist.changes.ch_val",
        "Technician_x0020_Name": "$Technician_x0020_Name",
        "dur_offset": "$_x0033_hr_offset",
        "Plan_dur": "$Planned_x0020_Duration",
        "Client_Proj": {
          "$concat": [
            "$Client",
            " - ",
            "$Project_x0020_Name"
          ]
        },
        "V_Date": {
          "$substr": [
            "$verhist.date",
            0,
            10
          ]
        },
        "V_Time": {
          "$substr": [
            "$verhist.date",
            11,
            5
          ]
        },
        "VmonthISO": {
          "$month": "$verhist._date"
        },
        "VweekISO": {
          "$week": "$verhist._date"
        },
        "VdayISO": {
          "$dayOfWeek": "$verhist._date"
        },
        "myVER": "$myVER",
        "mySTATUS": "$mySTATUS"
      }
    },
    {
      "$group": {
        "_id": "$VmonthISO",
        "count": {
          "$sum": 1
        }
      }
    }
  ]
}