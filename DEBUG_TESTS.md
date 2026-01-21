# Test Failure Analysis

Analyze and address the following test failures:

## Failed Test 1: /home/runner/workspace/tests/integration/core-functionality.test.js

### Output:
```
[1m[31m  [1m● [22m[1mQGenUtils Integration Tests › Utility Integration › should format file sizes[39m[22m

    [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

    Expected: [32m"1.00 KB"[39m
    Received: [31m{"bytes": 1024, "formatted": "1.0 KB", "size": 1, "unit": "KB", "unitIndex": 1}[39m
[2m[22m
[2m    [0m [90m 82 |[39m     it([32m'should format file sizes'[39m[33m,[39m () [33m=>[39m {[22m
[2m     [90m 83 |[39m       [36mconst[39m result [33m=[39m formatFileSize([35m1024[39m)[33m;[39m[22m
[2m    [31m[1m>[22m[2m[39m[90m 84 |[39m       expect(result)[33m.[39mtoBe([32m'1.00 KB'[39m)[33m;[39m[22m
[2m     [90m    |[39m                      [31m[1m^[22m[2m[39m[22m
[2m     [90m 85 |[39m     })[33m;[39m[22m
[2m     [90m 86 |[39m   })[33m;[39m[22m
[2m     [90m 87 |[39m[0m[22m
[2m[22m
[2m      [2mat Object.toBe ([22m[2m[0m[36mtests/integration/core-functionality.test.js[39m[0m[2m:84:22)[22m[2m[22m

[1m[31m  [1m● [22m[1mQGenUtils Integration Tests › Middleware Integration › should create API key validator[39m[22m

    createApiKeyValidator requires an apiKey in config
[2m[22m
[2m    [0m [90m 51 |[39m [36mfunction[39m createApiKeyValidator(config[33m:[39m [33mApiKeyValidatorConfig[39m) {[22m
[2m     [90m 52 |[39m   [36mif[39m ([33m![39mconfig[33m.[39mapiKey) { [90m// validate required configuration[39m[22m
[2m    [31m[1m>[22m[2m[39m[90m 53 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m([32m'createApiKeyValidator requires an apiKey in config'[39m)[33m;[39m[22m
[2m     [90m    |[39m           [31m[1m^[22m[2m[39m[22m
[2m     [90m 54 |[39m   }[22m
[2m     [90m 55 |[39m[22m
[2m     [90m 56 |[39m   [36mconst[39m {[0m[22m
[2m[22m
[2m      [2mat createApiKeyValidator ([22m[2mlib/utilities/middleware/createApiKeyValidator.ts[2m:53:11)[22m[2m[22m
[2m      [2mat Object.<anonymous> ([22m[2m[0m[36mtests/integration/core-functionality.test.js[39m[0m[2m:90:46)[22m[2m[22m

```

### Duration: 2433ms

---

## Failed Test 2: /home/runner/workspace/lib/logger.test.js

### Output:
```
  [1m● [22mTest suite failed to run

    [31m[1mConfiguration error[22m:[39m
    [31m[39m
    [31mCould not locate module [1mqtests/setup[22m mapped as:[39m
    [31m[1m/home/runner/workspace/node_modules/qtests/dist/$1[22m.[39m
    [31m[39m
    [31mPlease check your configuration for these entries:[39m
    [31m{[39m
    [31m  "moduleNameMapper": {[39m
    [31m    "/^qtests\/(.*)$/": "[1m/home/runner/workspace/node_modules/qtests/dist/$1[22m"[39m
    [31m  },[39m
    [31m  "resolver": [1mundefined[22m[39m
    [31m}[39m

    [0m[31m[1m>[22m[39m[90m 1 |[39m require([32m'qtests/setup'[39m)[33m;[39m
     [90m   |[39m [31m[1m^[22m[39m
     [90m 2 |[39m [36mconst[39m qtests [33m=[39m require([32m'qtests'[39m)[33m;[39m
     [90m 3 |[39m [36mconst[39m winston [33m=[39m require([32m'winston'[39m)[33m;[39m
     [90m 4 |[39m [36mconst[39m [33mDailyRotateFile[39m [33m=[39m require([32m'winston-daily-rotate-file'[39m)[33m;[39m[0m

      [2mat createNoMappedModuleFoundError ([22mnode_modules/jest-resolve/build/resolver.js[2m:759:17)[22m
      [2mat Object.require ([22m[0m[36mlib/logger.test.js[39m[0m[2m:1:1)[22m

```

### Duration: 0ms

---

## Summary

- Total failed tests: 2
- Failed test files: /home/runner/workspace/tests/integration/core-functionality.test.js, /home/runner/workspace/lib/logger.test.js
- Generated: 2026-01-21T06:42:21.877Z
