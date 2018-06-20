# Analytics Lookup APIs #
Current version - see package.json

### What is this repository for? ###

A nodejs app that allows lookups for
* diagnosis codes
* procedure codes
* rx codes
* product specific information (currently only APM)

### How do I get set up? ###

* Download repository into folder
* Install local mysql db,
* update /connection.db with your db credentials.

Run the following command in terminal...

``` npm start ```

### Security ###

Application is protected via bearer tokens. You can pass these programmatically via headers or through the querystring (not recommended).
Example token = 123456
Alternate usage: ?access_token=123456

### Usage ###
Go to a terminal, browser or postman...

Lookup APIs:
- [http://localhost:3000/api/lookup/diagnosis/R94.2]
- [http://localhost:3000/api/lookup/procedure/A0110]
- [http://localhost:3000/api/lookup/rx/577095]

Terminal
``` $ curl http://localhost:3000/api/lookup/diagnosis/R94.2?access_token=123456 ```

### Structure ###
For product APIs (APM), you can structure the calls to pull time and shape. Currently, the only additional shaping is for c3.
http://localhost:3000/api/data/apm/calls/daily/[time]/[shape]

Product APM Example (look at app.js in root for other example calls):
``` http://localhost:3000/api/data/apm/calls/daily/30/c3 ```

### Support ###
Documentation (needs updating):
- [http://localhost:3000/api/v1/]

* John Steinmetz, Product Analytics - jsteinmetz@socialcare.com
