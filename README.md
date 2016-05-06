Nova
====

Requirements
------------

* Node >= 4.X

Install
-------

```bash
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
// Individual build steps
npm run build:css
npm run build:js
npm run build:server

// Run all build steps
npm run build:dev
```

If you change any server files then you need to restart the server after `gulp`

Run
---

```bash
DEBUG=app:* npm run server
```

Point browser to: http://localhost:3000
