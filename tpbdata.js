const axios = require('axios')
const fs = require('fs')

let rurl =
  'http://api.tampa.onebusaway.org/api/where/trips-for-route/Hillsborough%20Area%20Regional%20Transit_'
let urlend = '.json?key=TEST'

axios
  .get(
    'http://api.tampa.onebusaway.org/api/where/routes-for-agency/Hillsborough%20Area%20Regional%20Transit.json?key=TEST'
  )
  .then(response => {
    console.log(response.data.data.list[0].id)
    let allRoutes = response.data.data.list
    printRoutes(allRoutes)
  })
  .catch(error => {
    console.log(error)
  })

function printRoutes(allRoutes) {
  let routList = allRoutes.map((data, index) => {
    console.log(index, data.shortName)
    getRoutes(data.shortName)
    return { id: data.id, longName: data.longName, shortName: data.shortName }
  })
}

function getRoutes(eachRoute) {
  let surl = rurl + eachRoute + urlend
  let allRoutes = ''
  console.log('getting... ' + surl)
  axios
    .get(surl)
    .then(response => {
      if (response.data.data.list[0]) {
        console.log('yess:>> ' + eachRoute)
        //console.log(eachRoute)
        // let rtrip =
        //   '{"' +
        //   eachRoute +
        //   '" : "' +
        //   response.data.data.list[0].tripId +
        //   '"},\n'
        console.log(JSON.stringify(response.data.data.list))
        writeData(eachRoute, response.data.data.list)
      } else {
        console.log('err:>> ' + eachRoute)
      }
      // allRoutes = response.data.data.list[0].tripId
      //JSON.stringify(response.data.data.list[0])
      //printRoutes(allRoutes)
    })
    .catch(error => {
      console.log(error)
    })

  console.log(allRoutes)

  //let routList = eachRoute.map(data => {

  //  return { id: data.id, longName: data.longName, shortName: data.shortName }
  //})
}

function writeData(bid, params) {
  // Change the content of the file as you want

  let routList2 = params.map((data, index) => {
    console.log(" **** " +data)
    return { bid: bid, id: data.tripId }
  })

  // The absolute path of the new file with its name
  var filepath = 'mynewfile.json'

  fs.appendFile(filepath, JSON.stringify(routList2), err => {
    if (err) throw err
    console.log(bid + ' saved!')
  })
}
