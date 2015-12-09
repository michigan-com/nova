Nova
====

Requirements
------------

* Node >= 4.X

Install
-------

```bash
npm install -g gulp
npm install
```

### Config

Create configuration file in base directory `./config.js`

```node
module.exports = require('./config/michigan');
//module.exports = require('./config/usatoday');
```

Dev
---

Any changes must be accompanied by:

```bash
gulp
```

If you change any server files then you need to restart the server after `gulp`

Run
---

```bash
DEBUG=app:* npm start
```

Point browser to: http://localhost:3000
