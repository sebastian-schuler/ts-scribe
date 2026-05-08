## [1.0.1](https://github.com/sebastian-schuler/ts-scribe/compare/v1.0.0...v1.0.1) (2026-05-08)


### Bug Fixes

* Configure semantic-release with exec and git user settings ([#3](https://github.com/sebastian-schuler/ts-scribe/issues/3)) ([1df338f](https://github.com/sebastian-schuler/ts-scribe/commit/1df338fcdfb77d7586249e4834914b87edba9ee7))

# 1.0.0 (2026-05-08)


### Bug Fixes

* add input validation to asyncMap function to ensure array is defined ([c5401d9](https://github.com/sebastian-schuler/ts-scribe/commit/c5401d9b1ba6b74fc0affc88253e442b2fccb4f3))
* added declaration file ([b05fe71](https://github.com/sebastian-schuler/ts-scribe/commit/b05fe71f695d54275193be3503e9e8e625c59273))
* added deepFreeze, isEmptyObject, safeJsonParse, sleep; updated readme; more consistent naming ([cd978b8](https://github.com/sebastian-schuler/ts-scribe/commit/cd978b86d7a0d23b178715f1b55b6c1b6bc452d0))
* added files property to package.json ([a67ed17](https://github.com/sebastian-schuler/ts-scribe/commit/a67ed1717cf094b8762b7924ba33101bae8cfa9c))
* added linting; dependencies updated; docs improved ([36807a0](https://github.com/sebastian-schuler/ts-scribe/commit/36807a07727973e612972d4a83cb15dfb1a659e8))
* exclude tests from build ([459727c](https://github.com/sebastian-schuler/ts-scribe/commit/459727cef4fb0d86d085ab2fe43cd80adfd354ad))
* import and export improvements ([7a03747](https://github.com/sebastian-schuler/ts-scribe/commit/7a0374737bcbb327c1808c04ff54ace6538106bf))
* import fix; bumped version ([b4cefa8](https://github.com/sebastian-schuler/ts-scribe/commit/b4cefa8c95ff9deb9e3d44ac7dace5d69a0bab67))
* improve concurrency validation error messages and enhance tests for edge cases ([82d4f2b](https://github.com/sebastian-schuler/ts-scribe/commit/82d4f2b461b952844d674535938f9a98b7680cdc))
* improve sleep function to handle negative delays and add corresponding tests ([972681d](https://github.com/sebastian-schuler/ts-scribe/commit/972681dc98836e9f36e5b455515321b8ca16bd21))
* improved linting ([ffcbc94](https://github.com/sebastian-schuler/ts-scribe/commit/ffcbc9490f5a65f6ce3fe27cc71572a0877f4ee4))
* linting errors; version bump ([85a8496](https://github.com/sebastian-schuler/ts-scribe/commit/85a8496e29132ffd46cf6ce6dff568e98af1b51b))
* minor issue in asyncForEach; type of isNotDefined; add slugify ([8b08919](https://github.com/sebastian-schuler/ts-scribe/commit/8b0891970e225e58a08824cc4bee9a8ae2813931))
* moved memoize tests to core category ([e168686](https://github.com/sebastian-schuler/ts-scribe/commit/e1686864678f96f1476432673f21f8622163f3b6))
* moved tests to correct folders ([dd76598](https://github.com/sebastian-schuler/ts-scribe/commit/dd765981f426c95b5cc2752d292311917b393294))
* **object:** ensure proper type assertion for nested objects in objectFlatten ([27e0069](https://github.com/sebastian-schuler/ts-scribe/commit/27e0069f0939faa974600fd900459356a997c31a))
* optimized import strategy ([08d8a3a](https://github.com/sebastian-schuler/ts-scribe/commit/08d8a3aa008f079aa0a9ff77ba4051d8dbf780b8))
* **package:** update node engine requirement to >=20 ([6879b0e](https://github.com/sebastian-schuler/ts-scribe/commit/6879b0e1b3d40443f727f5371fc031a2773abf61))
* remove docs from gitignore ([332cfff](https://github.com/sebastian-schuler/ts-scribe/commit/332cfffc4a266a294139a0218ce09431e1a45247))
* removed dead code ([3ccb9d4](https://github.com/sebastian-schuler/ts-scribe/commit/3ccb9d45d4764001f4ffae10e28199c8154f83b5))
* resolved type any eslint error ([60d9a0e](https://github.com/sebastian-schuler/ts-scribe/commit/60d9a0e28e7fc38832fc51c31c7262fd5c794646))
* reverted from esm module ([048c881](https://github.com/sebastian-schuler/ts-scribe/commit/048c881ae915573f59b52035e1bb63e0eeb7d976))
* specify type parameter for Set in arrayUniqueBy function ([a72e3e7](https://github.com/sebastian-schuler/ts-scribe/commit/a72e3e750c3c9389357d30ddf552b56245119e69))
* testing modular structure ([cdc23b1](https://github.com/sebastian-schuler/ts-scribe/commit/cdc23b176a6943d2145b22e6f28c4fd7f93abed5))
* **tests:** add tolerance for CI timer drift in sleep test ([a44edd6](https://github.com/sebastian-schuler/ts-scribe/commit/a44edd64cd124349adae98e7abec9379dd06df5f))
* tsconfig for prod ([1fb24db](https://github.com/sebastian-schuler/ts-scribe/commit/1fb24db0f004fdd964f1eee4ffb32d4cb66e9719))
* **tsconfig:** remove unnecessary module options from cjs and add compilerOptions to esm ([ac3e53a](https://github.com/sebastian-schuler/ts-scribe/commit/ac3e53ab37f545a4e69d6ee08654d23ca457fe73))
* update example in pruneObject documentation to reflect correct output for array case ([28e82f4](https://github.com/sebastian-schuler/ts-scribe/commit/28e82f4fa6e66f7ca34a909dd7c79503c7ef9b0f))
* update homepage URL in package.json ([03daebc](https://github.com/sebastian-schuler/ts-scribe/commit/03daebccaab31e0f38b7b761a29c6dd9094d0fcc))
* update install and bundle size badges in README.md ([ec14b77](https://github.com/sebastian-schuler/ts-scribe/commit/ec14b7702c3f63bac44c132f8808c1aab523f4ed))
* update isDefined type guard to exclude null in addition to undefined ([cd94fff](https://github.com/sebastian-schuler/ts-scribe/commit/cd94fff314d7ca63b2cc419f93e830305e371fb0))
* update repository URL format in package.json ([5f3eebd](https://github.com/sebastian-schuler/ts-scribe/commit/5f3eebd721a8c8846e4022660a0877497e5eaf3c))
* update waterfall function to throw error for empty task array and adjust return type ([fb4c968](https://github.com/sebastian-schuler/ts-scribe/commit/fb4c968a63927c45d88215a7bb99b626b9a65fcd))
* updated packages; resolved lint errors ([7a47777](https://github.com/sebastian-schuler/ts-scribe/commit/7a47777986912ae85a196630ac5ac22972367f23))
* updated readme; added jsdocs for benchmark function ([3489861](https://github.com/sebastian-schuler/ts-scribe/commit/3489861c3bf0da858f9876187a7101f4865c81c6))
* **workflow:** update node setup step to use npx for semantic-release ([ed34bbb](https://github.com/sebastian-schuler/ts-scribe/commit/ed34bbb3d59ce067c5761d397f2fe554b28303d8))


### Features

* add category annotations to types and improve log messages for lap counts ([b477698](https://github.com/sebastian-schuler/ts-scribe/commit/b47769833e62b255516fbc7a2e5418587049cedb))
* add createPerfTimer for measuring execution time with lap support and detailed logging ([8e8a490](https://github.com/sebastian-schuler/ts-scribe/commit/8e8a49034e9ef7156e04a3d8867f4d8a01a3f04c))
* add getIn function for safe nested value retrieval with type support ([b41d969](https://github.com/sebastian-schuler/ts-scribe/commit/b41d969296e68cc35a57c88ec21eaab4a2193c1c))
* add interpolateString function for string interpolation and corresponding tests ([c2a4cb1](https://github.com/sebastian-schuler/ts-scribe/commit/c2a4cb156b8d7949ae7b8de7f970ae7372edcdf0))
* add jsonByteSize function and tests for measuring JSON byte size ([8b1c62c](https://github.com/sebastian-schuler/ts-scribe/commit/8b1c62cfcad4709ec64897b1156e157884e853c2))
* add partitionArray function with tests and documentation ([10f36c7](https://github.com/sebastian-schuler/ts-scribe/commit/10f36c72fffeccaaf92d3138e3b923107dce6360))
* add pickObjectKeys and omitObjectKeys functions with corresponding tests ([9db26c8](https://github.com/sebastian-schuler/ts-scribe/commit/9db26c8fd9812347759b82f325dad8fac9121052))
* add setIn function for immutably setting nested values and update documentation ([8607d68](https://github.com/sebastian-schuler/ts-scribe/commit/8607d68b74b63ee991edb731e9480057aedbc966))
* add traceFunction for tracing function calls with detailed logging and metrics ([9ed9854](https://github.com/sebastian-schuler/ts-scribe/commit/9ed985445c05c76024bccbc9293403f71e4434a4))
* added arrUnique function ([de23998](https://github.com/sebastian-schuler/ts-scribe/commit/de239981a1cd6a3a40e117d3bb8a6fbf51104aab))
* added asyncMap function ([7f8be35](https://github.com/sebastian-schuler/ts-scribe/commit/7f8be35f806f41f8f78457da54c51e2d8aaaf50e))
* added benchmark function ([192cdf8](https://github.com/sebastian-schuler/ts-scribe/commit/192cdf8e6f368e829da4aaf3a85f777a6d7dc234))
* added case converters ([542f9a1](https://github.com/sebastian-schuler/ts-scribe/commit/542f9a1abb094f4a11168fff22693884ebf03f81))
* added functions flatten-object, prune-object, remove-keys, truncate-string, is-empty-value ([8dbaf7c](https://github.com/sebastian-schuler/ts-scribe/commit/8dbaf7cb333f338d8ef470e1cc88afee20a75615))
* added get gcd and scm functions; better test structure ([dbcc0d8](https://github.com/sebastian-schuler/ts-scribe/commit/dbcc0d85fb320a087310ac68bfbbc5599932461e))
* added isNode, isBrowser; updated README ([8068a3e](https://github.com/sebastian-schuler/ts-scribe/commit/8068a3e5e3aed928aabd915563b047f7f463008c))
* added parseBoolean, isString, randomUtilities; more tests ([3de69c5](https://github.com/sebastian-schuler/ts-scribe/commit/3de69c58219f22429373b25b3f29984938c0dd8e))
* added parseNumber ([43a9828](https://github.com/sebastian-schuler/ts-scribe/commit/43a9828300f27c3f22337e19fb6b31e70a1c78ac))
* added pluck and groupBy; array functions now inside a subclass ArrayUtils ([29aced2](https://github.com/sebastian-schuler/ts-scribe/commit/29aced22ba1bd746893b87e49a57df66d90899ec))
* added run function ([652d98d](https://github.com/sebastian-schuler/ts-scribe/commit/652d98d8290dfd24ab8e01f821dbeeb86ab065df))
* added safeJsonStringify; removed isNotDefined ([4244202](https://github.com/sebastian-schuler/ts-scribe/commit/4244202b7eafea66a4a5a654ef6f78fef941f15f))
* Added Serializable type ([4265b71](https://github.com/sebastian-schuler/ts-scribe/commit/4265b7123c76176ed191c364f9d4523de5752247))
* added typeguards; collected isString and isNumber in typeguards instead ([7175b24](https://github.com/sebastian-schuler/ts-scribe/commit/7175b2485eee12bbc05c68e5396c689d3df06db8))
* added uniqueBy ([d0bb8e3](https://github.com/sebastian-schuler/ts-scribe/commit/d0bb8e327ae093fe6e9443470977e3975c0c198c))
* added waterfall and asyncForEach ([d99fbeb](https://github.com/sebastian-schuler/ts-scribe/commit/d99fbebc3e1f69147c173c4c7ef04ab3f025dca5))
* **array:** add validation for chunk size in arrayChunk function ([1f62e21](https://github.com/sebastian-schuler/ts-scribe/commit/1f62e218b850801fb213b92e0a24df97401a5a48))
* changed jest to vitest; modulized the code ([e296bbc](https://github.com/sebastian-schuler/ts-scribe/commit/e296bbc45219344e7ab8a15914a25a64270cf435))
* enhance asyncForEach to support concurrency options and error handling ([8ae9581](https://github.com/sebastian-schuler/ts-scribe/commit/8ae9581374421ca97ac0b05d7ce4cc2faecce6b5))
* enhance benchmark functionality with detailed logging and result metrics ([33edc51](https://github.com/sebastian-schuler/ts-scribe/commit/33edc5141f6ac36bce19fda168ddbe0a701d60d2))
* enhance pruneObject with options and update tests for new functionality ([80f0d7b](https://github.com/sebastian-schuler/ts-scribe/commit/80f0d7b0adfd140b471e52124567d69dea4cfd04))
* enhance truncateString function and tests for preserveWords behavior and custom ellipsis ([73b45ba](https://github.com/sebastian-schuler/ts-scribe/commit/73b45baac3f6a41021ac2bb3f66fa4382545a3f5))
* implement asyncFilter function for asynchronous array filtering with concurrency control and error handling ([d092042](https://github.com/sebastian-schuler/ts-scribe/commit/d092042ae656b1e880bb2507ec0dc8069a30290a))
* implement maskObject function for recursive masking of sensitive properties in objects ([bdcebb5](https://github.com/sebastian-schuler/ts-scribe/commit/bdcebb5d5c19306cf5f32e9747f4bf595a2a2153))
* improve arrayIntersection and arrayIntersectionDeep tests for edge cases and empty arrays ([4e76577](https://github.com/sebastian-schuler/ts-scribe/commit/4e76577f4eb690a1161e6719ea8735b547362aec))
* **memoization:** implement memoizeSafeStringify for circular reference handling and depth limitation ([f26b919](https://github.com/sebastian-schuler/ts-scribe/commit/f26b91951d444efb0f04f8b8d5e15792f514154a))
* merged development; bumped version to 0.2.1 ([0ca8b1c](https://github.com/sebastian-schuler/ts-scribe/commit/0ca8b1c27dc764a013aa600bff69a583fc482b5a))
* moved memoize to core category ([97e077b](https://github.com/sebastian-schuler/ts-scribe/commit/97e077b0910404578001bb800d8f27dae624efcf))
* **object:** implement objectDeepClone function with DeepCloneOptions type and prototype flattening ([0e2a1ab](https://github.com/sebastian-schuler/ts-scribe/commit/0e2a1ab8dd30cf25af8019cddf101aad8b38eca7))
* remove deprecated tests and add new ones for debounce, deep equals, and truncate functions ([d52f2e8](https://github.com/sebastian-schuler/ts-scribe/commit/d52f2e8bb01ddd19653c2b318837041a89c1fd39))
* update arrayPowerset to return an empty array instead of an array containing an empty array, and add tests for single-element and duplicate-element cases ([0a2fe65](https://github.com/sebastian-schuler/ts-scribe/commit/0a2fe657fe9482ae9d7a18f383e4718ebe70a2f0))
* update isNumber type guard to accept numeric strings and enhance tests for various cases ([c8841fb](https://github.com/sebastian-schuler/ts-scribe/commit/c8841fb8d5dd60e7812c25f2bfb5160ac3ba28ea))
* update parseBoolean and parseNumber functions to handle null values and improve type definitions ([3029735](https://github.com/sebastian-schuler/ts-scribe/commit/30297353ef409592bfe680b827a95ff47d0cd4a2))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
