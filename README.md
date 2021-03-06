[![Build Status](https://travis-ci.org/YagoLopez/metaphasejs.svg?branch=master)](https://travis-ci.org/YagoLopez/metaphasejs) [![Greenkeeper badge](https://badges.greenkeeper.io/YagoLopez/metaphasejs.svg)](https://greenkeeper.io/)
 [![Maintainability](https://api.codeclimate.com/v1/badges/c264e58f56102a22476c/maintainability)](https://codeclimate.com/github/YagoLopez/metaphasejs/maintainability) <!--[![Known Vulnerabilities](https://snyk.io/test/github/YagoLopez/metaphasejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/YagoLopez/metaphasejs?targetFile=package.json)--> [![Coverage Status](https://coveralls.io/repos/github/YagoLopez/metaphasejs/badge.svg?branch=master)](https://coveralls.io/github/YagoLopez/metaphasejs?branch=master) 
<!--![license](https://img.shields.io/github/license/mashape/apistatus.svg) [![Packages Analysis](https://img.shields.io/badge/packages-analysis-blue.svg)](analysis.html)-->

![NPM package](https://nodei.co/npm/metaphasejs.png)


[![Repository stats](https://github-readme-stats.vercel.app/api?username=YagoLopez&hide=["contribs"])](https://github.com/anuraghazra/github-readme-stats)


# MetaphaseJS

Super easy, efficient and agnostic state management for Javascript

# Demo

- [Link and code examples](https://github.com/YagoLopez/metaphasejs-react-demo)

# Usage

```javascript
// Install
yarn add metaphasejs // Yarn
npm install metaphasejs // NPM

// Build
yarn / npm build

// Test
yarn / npm test
```

## API Docs

- [Link](https://yagolopez.js.org/metaphasejs/docs/index.html)

## Packages Analysis

- Without gzip compression: [Link](https://yagolopez.js.org/metaphasejs/analysis.html)

## Test Coverage

- [Jest Report](https://yagolopez.js.org/metaphasejs/coverage/lcov-report/index.html)
- [Coveralls Report](https://coveralls.io/github/YagoLopez/metaphasejs)

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Caveats

- **IMPORTANT**: at this moment MetaphaseJS is not totally compatible with create-react-app (CRA) . The use of `constructor.name` breaks the compiled code by the CRA build script. The **uglifying process** has to be made with an *ad hoc* script called `build.js`. This script avoids to *mangle* funcion names using the option `mangle: {keep_fnames: true}`. Open an issue for more information. Pull requests are welcome.
- At this moment there are not **polyfills** for old browsers, but there will be in the future.
- If **Typescript** and **decorators** are used, its configuration file `tsconfig.json` must have:
  - `experimentalDecorators = true`
  - `emitDecoratorMetadata = true`
  - If flag `strict = true` is used, model properties (columns in db) must be initialized with values

## License

MIT

<p align="center"><a href="#">Back to top</a> ↑</p>

