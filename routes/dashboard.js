var express = require('express')
var mongoose = require('mongoose')
var Location = require('../models/location')
var Plot = require('../models/plot')
var Data = require('../models/data')
var Bio = require('../models/bio')
var router = express.Router()

router.get('/dashboard', function(req, res) {
    
    // if(req.user) {
        let locations = getAllLocations( function(locations) {
            console.log(locations)
            res.render('dashboard', {
                locations: locations,
                location: locations[0],
                user: req.user, 
                page: '/dashboard',
                current: {
                    location: locations[0].location.name,
                    plot: null
                }
            })
        });
    // } else {
        // res.redirect('/login')
    // }

})

router.get('/dashboard/:location', function(req, res) {
    
    // if(req.user) {

        var locationid = req.params.location;
        var Location = mongoose.model('Location');

        let alllocations = getAllLocations( function(locations) {
            let singlelocation = getlocation(locationid, function(location) {
                res.render('location/location', {
                    locations: locations,
                    location: location,
                    user: req.user, 
                    page: '/dashboard/'+location.location.name,
                    current: {
                        location: location.location.name,
                        plot: null
                    }
                })
            })
        });
    // } else {
        // res.redirect('/login')
    // }

})

router.get('/manual/:location/:plot', function(req, res) {
    // if(req.user) {
        let plotid = req.params.plot;
        let locationid = req.params.location;

        let alllocations = getAllLocations( function(locations) {
            let location = getlocation( locationid, function(location) {
                // console.log(location);
                let plot = getplot( plotid, function(plot) {
                    // console.log(plot);
                    let data = getDataByPlot(plotid, function(data) {
                        // console.log(data);
                        res.render('plot/manual-data', {
                            locations: locations,
                            location: location,
                            plot: plot,
                            data: data.reverse(),
                            user: req.user, 
                            page: '/dashboard/'+location.location.name + '/' + plot.info.plotnumber,
                            current: {
                                location: location.location.name,
                                plot: plot._id
                            }
                        })
                    })
                });
            })
        })
    // } else {
        // res.redirect('/login')
    // }
})

router.post('/manual/:location/:plot/add', function(req, res) {
    // if(req.user) {
        let plotid = req.params.plot;
        let locationid = req.params.location;
        let bio = new Bio({
            plot: req.body.plot,
            timestamp: new Date(),
            reading: req.body.reading
        })
        console.log(req.body)
        bio.save(function(err, bio) {
            if (err) {
                throw err
            } else {
                res.send({data:bio})
            }
        })
        
    // } else {
        // res.redirect('/login')
    // }
})

router.get('/dashboard/:location/:plot', function(req, res) {
    // if(req.user) {
        let plotid = req.params.plot;
        let locationid = req.params.location;

        let location = getlocation( locationid, function(location) {
            // console.log(location);
            let plot = getplot( plotid, function(plot) {
                // console.log(plot);
                let data = getDataByPlot(plotid, function(data) {
                    // console.log(data);
                    res.render('plot/plot-data', {
                        location: location,
                        plot: plot,
                        data: data,
                        user: req.user, 
                        page: '/dashboard/'+location.location.name + '/' + plot.info.plotnumber,
                        current: {
                            location: location.location.name,
                            plot: plot._id
                        }
                    })
                })
            });
        })
    // } else {
        // res.redirect('/login')
    // }
})

// router.get('dashboard/:location/:plot/manual', function(req, res) {

// }

router.get('/edit/:location/:plot', function(req, res) {
    // if(req.user) {
        var plotid = req.params.plot;
        var locationid = req.params.location;
        var plot = Plot.findById(plotid, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                var location = Location.findById(locationid, function(err, location) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.render('plot/edit-plot', {
                            plot: doc,
                            location: location,
                            user: req.user, 
                            page: '/dashboard'
                        })
                    }
                })
            }
        })
    // } else {
        // res.redirect('/login')
    // }
})

router.post('/edit/:location/:plot', function(req, res) {
    // if(req.user) {
        var parentid = req.params.location
        var plotid = req.params.plot

        var plotinfo = Plot.findById(plotid, function(err, plot) {
            if (err) {
                console.log(err);
            } else {
                plot.info.crops = req.body['crops[]'];
                plot.info.vwc.saturation = req.body.saturation;
                plot.info.vwc.capacity = req.body.capacity;
                plot.info.vwc.dry = req.body.dry;

                plot.save(function(err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.send('plot updated')
                    }
                });
            }
        })
    // } else {
        // res.redirect('/login')
    // }
})

router.post('/dashboard/add-location', function(req, res, next) {
    console.log(req.body)
    var Location = mongoose.model('Location')
    // console.log(JSON.stringify(count, null, 2))

    var location = new Location ({
        location: {
            name: req.body.name,
            address: req.body.address
        },
        meta: {
            created: {
                username: req.user,
                date: new Date().getTime()
            },
            updated: {
                username: req.user,
                date: new Date().getTime()
            }
        }
    })

    location.save(function(err) {
        if (err) {
            console.log(err)
        } else {
            res.send('location added')
        }
    })
})

router.post('/:location/add-plot', function(req, res, next) {
    var Plot = mongoose.model('Plot');
    var Location = mongoose.model('Location');
    var parentid = req.params.location;
    var number = Plot.count({}, function(err, count) {
        var plot = new Plot({
            location: parentid,
            info: {
                plotnumber: count+1,
                crops: ['wheatgrass', 'test'],
                water: Math.floor(Math.random()*4)
            },
            data: [],
            meta: {
                created: {
                    username: req.user,
                    date: new Date().getTime()
                },
                updated: {
                    username: req.user,
                    date: new Date().getTime()
                }
            }
        })

        plot.save(function(err, newplot) {
            if (err) {
                console.log(err)
            } else {

                var location = Location.findById(parentid, function(err, location) {
                    location.plots.push(plot._id);
                    location.save(function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('plot added to location')
                            res.send({
                                location: location,
                                plot: newplot
                            })
                        }
                    })
                });
            }
        })
    });
    // console.log('id: '+ parentid)
})

router.post('/delete/plot/:plot', function(req, res, next) {
    var Plot = mongoose.model('Plot');
    console.log(req.params.plot)
    var plotid = req.params.plot;

    Plot.findByIdAndRemove(plotid, function(err) {
        if (err) {
            console.log(err)
        } else {
            res.send({redirect:'/dashboard'})
        }
    })
})

router.post('/:location/:plot/add-data', function(req, res, next) {
    var Plots = mongoose.model('Plot');
    var Data = mongoose.model('Data');
    console.log('python time: '+ req.body.timestamp)
    var reading = new Data({
        plot: req.params.plot,
        timestamp: new Date(req.body.timestamp),
        moisture: req.body.moisture,
        temp: req.body.temp
    })
    reading.save(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log('data document created');

            Plots.findById(req.params.plot, function(err, plot) {
                if (err) {
                   console.log(err)
                } else {
                    console.log(data.timestamp)
                    let time = data.timestamp
                    let timeString =  time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                    plot.current = {
                        timestamp: {
                            time: time,
                            string: timeString
                        },
                        moisture: data.moisture,
                        temp: data.temp
                    }
                    plot.save(function(err, newplot) {
                        if (err) {
                            console.log(err);
                            res.send(err)
                        } else {
                            console.log('plot updated');
                            // console.log(newplot)
                            res.send('data added')
                        }
                    });
                }
            })

        }
    })
})

router.get('/update', function(req, res) {
    var Plots = mongoose.model('Plot');
    var data = [];

    var allPlots = Plots.find({}, function(err, plots) {
        if (err) {
            console.log(err)
        } else {
            for (var i = plots.length - 1; i >= 0; i--) {
                var plot = {
                    id: plots[i]._id,
                    current: plots[i].current
                }  
                data.push(plot)
            }
            res.send({ update: data });
        }
    })
})

router.get('/manual/:plot', function(req, res) {
    // if(req.user) {
        var plotid = req.params.plot;
        var plot = Plot.find({plot: plotid}, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                res.render('manual-measurements', {
                    readings: doc,
                    user: req.user, 
                    page: '/dashboard'
                })
            }
        })
    // } else {
        // res.redirect('/login')
    // }
})

router.get('/double-check', function(req, res) {
    res.render('check', {})
})

function getAllLocations(callback) {
    var Location = mongoose.model('Location');
    var locations = Location.find({},{}).populate('plots').exec( function(err, locations){
        if(err) {
            throw err;
        } else {
            if (callback && typeof(callback) === "function") {
                callback(locations);
            }
        }
    });
}

function getlocation(id, callback) {
    var Location = mongoose.model('Location');
    Location.findOne({ _id: id }).populate('plots').exec( function(err, location) {
        if(err) {
            throw err;
        } else {
            if (callback && typeof(callback) === "function") {
                callback(location);
            }
        }
    });
}

function getplot(id, callback) {
    var Plots = mongoose.model('Plot');
    Plots.findById(id, function(err,plot) {
        if(err) {
            throw err;
        } else {
            if (callback && typeof(callback) === "function") {
                callback(plot);
            }
        }
    })
}

function getDataByPlot(id, callback) {
    var Data = mongoose.model('Data');
    var data = Data.find({ plot: id }).sort({timestamp: 1}).exec( function(err, data) {
        if (err) {
            console.log(err)
        } else {
            if (callback && typeof(callback) === "function") {
                callback(data);
            }
        }
    })
}

module.exports = router