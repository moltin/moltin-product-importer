# Product Import
Import base product information from a CSV into Moltin.

## Setup and run
1. Add your product CSV to the root of this repository

2. In map.js, for each value, replace each instance of `X` with the field name in the CSV that will be mapped to the given field in moltin.

3. Rename `.example.env.yml` to `.env.yml` and add values to each variable.

4. Make sure you have Redis installed locally.

5. Run `redis-server` or grab URL or remote `redis` instance.

6. If you are  using a URL from step 5, configure `Kue` to use this redis instance

7. Run `yarn`

8. Run `sls invoke local -f processGet` function only.

9. Run the `sls invoke local -f processUpdate` function only.

10. Run the `sls invoke local -f processInsert` function only.

> You may want to run Kue's dashboard, in which case you can call:
>
> `node_modules/kue/bin/kue-dashboard -p 3050 -r redis://127.0.0.1:6379`
>
> from the root of the repository.

> You may want to clear out `redis` before starting a new job, in which case access `redis-cli` and call `FLUSHALL`

> Do not run `get`, `update`, and `insert` at once, as this will hit the rate limit quickly.

> Do not use node version 10.7.0
