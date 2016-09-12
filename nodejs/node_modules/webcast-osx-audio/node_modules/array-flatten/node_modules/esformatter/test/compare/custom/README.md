# custom settings tests

These files are used to test custom settings. It should try to test the
*opposite* of the default settings whenever possible.

`foo_bar-in.js` will be used as input and will be compared with
`foo_bar-out.js`, `foo_bar-config.json` will be passed as the custom settings
on the `esformatter.parse()` call.

