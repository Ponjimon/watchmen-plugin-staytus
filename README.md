watchmen-plugin-staytus
===

A plugin for [watchmen](https://github.com/iloire/watchmen) to forward status updates to [Staytus](http://staytus.co).

Environment variables
---

Config is set through env variables (same as with watchmen itself).

```sh
export WATCHMEN_STAYTUS_URL='<URL to your Staytus installation>'
export WATCHMEN_STAYTUS_TOKEN ='<Staytus API Token>'
export WATCHMEN_STAYTUS_SECRET ='<Staytus API Secret>'
```

The service name in Watchmen needs to be identical with the service name in Staytus!