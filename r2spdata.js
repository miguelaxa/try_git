/* eslint semi: ["error", "always"] */
import _ from 'underscore';
var artoo = {};
var $ = {};
var spdata = {};

$(document).ready(function () {
  var mdata = [];

  if (spdata.dsQueryResponse.Rows !== null) {
    if (spdata.dsQueryResponse.Rows.Row instanceof Array) {
      mdata = spdata.dsQueryResponse.Rows.Row;
    } else {
      mdata = [];

      mdata.push(spdata.dsQueryResponse.Rows.Row);
    }
  } else {
    mdata = [];
  }

  // var mmresult = mdata
  //   .reduce(
  //     function (res, obj) {
  //       if (!(obj.category in res)) res.__array.push((res[obj.category] = obj));
  //       else {
  //         res[obj.category].hits += obj.hits;
  //         res[obj.category].bytes += obj.bytes;
  //       }
  //       return res;
  //     },
  //     {
  //       __array: []
  //     }
  //   )
  //   .__array.sort(function (a, b) {
  //     return b.bytes - a.bytes;
  //   });

  var DataGrouper = (function () {
    var has = function (obj, target) {
      return _.some(obj, function (value) {
        return _.isEqual(value, target);
      });
    };

    var keys = function (data, names) {
      return _.reduce(
        data,
        function (memo, item) {
          var key = _.pick(item, names);
          if (!has(memo, key)) {
            memo.push(key);
          }
          return memo;
        },
        []
      );
    };

    var group = function (data, names) {
      var stems = keys(data, names);
      return _.map(stems, function (stem) {
        return {
          key: stem,
          vals: _.map(_.filter(data, stem), function (item) {
            return _.omit(item, names);
          })
        };
      });
    };

    group.register = function (name, converter) {
      return (group[name] = function (data, names) {
        return _.map(group(data, names), converter);
      });
    };

    return group;
  })();

  DataGrouper.register('sum', function (item) {
    return _.extend({}, item.key, {
      Value: _.reduce(
        item.vals,
        function (memo, node) {
          return memo + Number(node.Value);
        },
        0
      )
    });
  });

  function createDataRows (params) {
    var dataRows = params.data;

    if (params.unwindPath) {
      dataRows = [];
      params.data.forEach(function (dataEl) {
        var unwindArray = _.get(dataEl, params.unwindPath);
        var isArr = Array.isArray(unwindArray);

        if (isArr && unwindArray.length) {
          unwindArray.forEach(function (unwindEl) {
            var dataCopy = _.cloneDeep(dataEl);
            _.set(dataCopy, params.unwindPath, unwindEl);
            dataRows.push(dataCopy);
          });
        } else if (isArr && !unwindArray.length) {
          var dataCopy = _.cloneDeep(dataEl);
          _.set(dataCopy, params.unwindPath, undefined);
          dataRows.push(dataCopy);
        } else {
          dataRows.push(dataEl);
        }
      });
    }

    return dataRows;
  }

  console.log('>> Data info: >>' + mdata.length);

  //  document.write(">> Data info: >>" + mdata.length)

  $('#output').html('>> Data info: >>' + mdata.length);

  // var serviceURL = "https://spsite.com/_layouts/Versions.aspx?list=%7BA661C311-3B90-446B-A3DC-40DF0E08CD49%7D&Id="

  // function countOccurrences (regex, str) {
  //   if (!regex.global) {
  //     throw new Error('Please set flag /g of regex');
  //   }

  //   return (str.match(regex) || []).length;
  // }

  artoo.on('ready', function () {
    //  $("#output").click(run())

    // Artoo Spider for http://www.immobiliare.it/info/ufficio-stampa

    var scrape = {
      iterator: 'table.ms-settingsframe >  tbody > tr:nth-child(even)',
      data: {
        ver: function () {
          return artoo
            .$(this)
            .find('td.ms-vb2')
            .html()
            .trim();
        },

        date: function () {
          var html = artoo
            .$(this)
            .find('td.ms-vb a[href^=\\/sites]')
            .clone();

          html.find('.data').remove();

          var text = html
            .text()
            .trim()
            .replace(/\t/g, '');

          // //  return text

          //   return 'ISODate("' +  new Date(text).toISOString()+'")'
          //  return new(Date(text) - tzoffset).toISOString().slice(0, -1)

          var gmtDate = new Date(text);

          return new Date(gmtDate.getTime() + -4 * 3600 * 1000).toISOString();
        },
        _date: function () {
          var html = artoo
            .$(this)
            .find('td.ms-vb a[href^=\\/sites]')
            .clone();
          html.find('.data').remove();
          var text = html
            .text()
            .trim()
            .replace(/\t/g, '');
          var local = new Date(text);
          // var local = new Date().format("yyyy-MM-ddThh:mm:ss"); //today (local time)
          var offset = local.getTimezoneOffset() / 60;
          var localh =
            local.format('yyyy-MM-ddTHH:mm:ss') + '-0' + offset + ':00';
          return { $date: localh };
          // return { "date": localh }
        },

        user: {
          sel: 'td.ms-vb2 a[href^=\\/sites]',

          method: function ($) {
            return $(this)
              .text()
              .trim()
              .replace(/\t/g, '');
          }
        },

        changes: {
          sel: ' + tr',
          method: function ($) {
            return artoo.scrape($(this).find('tr'), {
              ch_key: {
                sel: 'td.ms-propertysheet',
                method: function () {
                  return $(this)
                    .text()
                    .trim()
                    .replace(/\t/g, '');
                }
              },
              ch_val: {
                sel: 'td.ms-vb',
                method: function () {
                  return $(this)
                    .text()
                    .trim()
                    .replace(/\t/g, '');
                }
              }
            });
          }
        }
      },
      params: {
        limit: 15
      },
      savePrettyJson: function (obj) {
        artoo.savePrettyJson(obj);
      }
    };

    function process (data) {
      // loop sites
      var result = artoo.scrape(
        artoo.$(data).find(this.iterator),
        this.data,
        this.params
      );
      console.log(this.data);
      //   console.log(JSON.stringify(result, null, 2))
      // var byfour2 = result.reduce(function (groups, n) {
      //   var key = n % 4 === 0 ? 'yes' : 'no'
      //   ;(groups[key] = groups[key] || []).push(n);
      //   return groups;
      // }, {});

      // var byfour1 = result.map(function (transformer) {
      //   return transformer.user;
      // });

      var byfour = result.filter(function (transformer) {
        // return transformer.user === '/Pena, Elvis/'
        // return /^C/.test(transformer.user) ;// === '/Pena, Elvis/'
        return /^2017*/.test(transformer.date);
        //   return transformer.user === 'Connor, Miguel'
      });

      var hist = byfour.reduce(function (prev, item) {
        if (item.user in prev) prev[item.user]++;
        else prev[item.user] = 1;
        return prev;
      }, {});

      // console.log(byfour)

      $('#output').append('<br>' + JSON.stringify(hist) + ' : ' + byfour.length);
      //  $('#output').append('<li>' + result[0].ver + ' ' + result[0].date + ' ' + result[0].user + ' </li>')
      // artoo.writers.csv(result)
      return result;
    }

    function spider (urlList, params) {
      artoo.ajaxSpider(urlList, {
        done: function (data) {
          // console.log(JSON.stringify(data))
          // var nobj = {};
          for (var i = 0; i < mdata.length; i++) {
            mdata[i]['verhist'] = data[i];
            //  console.log(mdata[i])
          }

          var somedata = createDataRows({
            data: mdata,
            fields: ['client', 'Title', 'verhist.user', 'verhist.date'],
            unwindPath: 'verhist'
          });

          //  console.log(somedata)

          var byfour = somedata.filter(function (recData) {
            // return recData.user === '/Pena, Elvis/'
            // return /^C/.test(recData.user) ;// === '/Pena, Elvis/'
            return /^2017-03/.test(recData.verhist.date);
            //   return recData.user === 'Connor, Miguel'
          });

          var hist = byfour.reduce(function (prev, item) {
            if (item.verhist.user in prev) prev[item.verhist.user]++;
            else prev[item.verhist.user] = 1;
            return prev;
          }, {});

          console.log('cd' + JSON.stringify(hist));

          var noc = DataGrouper.sum(byfour, ['verhist.user']);
          console.log(noc);

          artoo.savePrettyJson(somedata);

          // var rmdata = JSON.stringify(somedata, null, 2);
          // var my_e_mdata = rmdata
          //   .replace(/\\n/g, '\\n')
          //   .replace(/\\'/g, "\\'")
          //   .replace(/\\"/g, '\\"')
          //   .replace(/\\&/g, '\\&')
          //   .replace(/\\r/g, '\\r')
          //   .replace(/\\t/g, '\\t')
          //   .replace(/\\b/g, '\\b')
          //   .replace(/</g, '&lt')
          //   .replace(/\\f/g, '\\f');
          // output to exitor maybe
          // $('#output2').append('<pre>' + my_e_mdata + '</pre>')
        },
        // scrape: scrape,
        process: process.bind(scrape),
        throttle: 0
      });
    }

    function run () {
      //  var urlbac = "https://spsite.com/sites/itspmo_archive/icc/_layouts/Versions.aspx?list={2DCF95ED-AA09-45B1-A39A-5C9F983AD6CB}&ID=146192&IsDlg=1

      var urlTemplate =
        'https://spsite.com/_layouts/Versions.aspx?list=%7BA661C311-3B90-446B-A3DC-40DF0E08CD49%7D&Id=';

      // var ids = [1123, 665, 662];

      //  console.log(urlTemplate)

      var urlList = mdata.map(function (id) {
        return urlTemplate + id.ID + '&isDlg=0';
      });

      spider(urlList, urlTemplate);
    }

    // function run2 () {
    //   var urlTemplate =
    //     'https://spsite.com/sites/itspmo_archive/icc/_layouts/Versions.aspx?list={68C8D0F5-ED1B-440F-925A-F8D28CCE24EE}&ID=';

    //   // var urlTemplate = "https://spsite.com/_layouts/Versions.aspx?list=%7BA661C311-3B90-446B-A3DC-40DF0E08CD49%7D&Id=",

    //   var mids = [
    //     125741,
    //     130710,
    //     128979,
    //     124716,
    //     122292,
    //     138221,
    //     139738,
    //     141583,
    //     131261
    //   ];

    //   //  console.log(urlTemplate)

    //   var urlList = mids.map(function (id) {
    //     return urlTemplate + id + '&isDlg=0';
    //   });
    //   console.log(urlList);

    //   spider(urlList, urlTemplate);
    // }

    run();
    // run2()
  });
});

// https://spsite.com/SitePages/dev_dashpart_w.aspx?FilterMultiValue=*First*&FilterName=Client
