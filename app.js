var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var cors          = require('cors');

// Authentication is handled at the individual route level

// routing
var routes                  = require('./routes/index');

// login endpoints
var userlogin                   = require('./routes/userlogin');

// lookup endpoints
var rx                      = require('./routes/rx');
var rx_generic              = require('./routes/rx_generic');
var diagnosis               = require('./routes/diagnosis');
var procedure               = require('./routes/procedure');
var outpatient_charge       = require('./routes/outpatient_charge');
var medicare_coverage       = require('./routes/medicare_coverage');

//testing shaper
var shape                   = require('./routes/shape');
var shape_spline            = require('./routes/shape_spline');

// data endpoints
// var apm_calls_summary       = require('./routes/apm/calls_summary');
// var apm_calls_user          = require('./routes/apm/calls_user');
// var apm_calls_disposition   = require('./routes/apm/calls_disposition');
// var apm_calls_daily         = require('./routes/apm/calls_daily');
// var apm_calls_actionplan    = require('./routes/apm/calls_actionplan');
// var apm_calls_provider      = require('./routes/apm/calls_provider');
// var apm_actionplan_volume   = require('./routes/apm/actionplan_volume');
// var apm_actionplan_provider = require('./routes/apm/actionplan_provider');
// var apm_eventtype_schedule  = require('./routes/apm/eventtype_schedule');
// var apm_patients_provider   = require('./routes/apm/patients_provider');
// var apm_patients_seen       = require('./routes/apm/patients_seen');
// var apm_patients_eventtype  = require('./routes/apm/patients_eventtype');

var app                     = express();

app.use(require('morgan')('combined'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use('/api/v1/', express.static(path.join(__dirname, 'apidoc')))

// index route
app.use('/', routes);

// login URL
app.use('/api/login', userlogin);

// API shaping test
app.use('/api/data/shape', shape);
app.use('/api/data/shape/spline', shape_spline);

// API Lookup URLs
app.use('/api/lookup/diagnosis', diagnosis);  // done
app.use('/api/lookup/procedure', procedure);  // done
app.use('/api/lookup/rx', rx);                // done
app.use('/api/lookup/rx_generic', rx_generic);// done
app.use('/api/lookup/outpatient/charge', outpatient_charge); //done
app.use('/api/lookup/medicare/coverage', medicare_coverage); // done but needs validation

// Examples
// http://localhost:3000/api/lookup/diagnosis/Z76.89?access_token=123456
// http://localhost:3000/api/lookup/procedure/heart%20failure?access_token=123456
// http://localhost:3000/api/lookup/rx/metformin?access_token=123456
// http://localhost:3000/api/lookup/rx_generic/metformin?access_token=123456
// http://localhost:3000/api/lookup/outpatient/charge/2014/1/10?access_token=123456
// http://localhost:3000/api/lookup/medicare/coverage/1?access_token=123456



// APM Data Urls
// app.use('/api/data/apm/calls/summary', apm_calls_summary);              // done, metric
// app.use('/api/data/apm/calls/user', apm_calls_user);                    // done, c3
// app.use('/api/data/apm/calls/disposition', apm_calls_disposition);      // done, c3
// app.use('/api/data/apm/calls/daily', apm_calls_daily);                  // done, c3, shaped
// app.use('/api/data/apm/calls/actionplan', apm_calls_actionplan);        // done, c3
// app.use('/api/data/apm/calls/provider', apm_calls_provider);            // done, c3

// app.use('/api/data/apm/actionplan/volume', apm_actionplan_volume);      // done, c3, shaped
// app.use('/api/data/apm/actionplan/provider', apm_actionplan_provider);  // done, c3

// app.use('/api/data/apm/eventtype/schedule', apm_eventtype_schedule);    // done, metric

// app.use('/api/data/apm/patients/provider', apm_patients_provider);
// app.use('/api/data/apm/patients/seen', apm_patients_seen);
// app.use('/api/data/apm/patients/eventtype', apm_patients_eventtype);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
