# Deckers Import

> Requires Redis

- Run `redis-server` or grab URL or remote `redis` instance.
- If using URL, configure `Kue` to use this redis instance
- Grab the CSV data and drop it into this folder.
- Configure the `imagesLocation` constant to point to a new images folder if necessary
- Configure the `csvLocation` constant to point to a new CSV file if necessary
- First, run the `sls invoke local -f processGet` function only.
- Then, run the `sls invoke local -f processUpdate` function only.
- Then, run the `sls invoke local -f processInsert` function only.

> You may want to run Kue's dashboard, in which case you can call:
>
> `node_modules/kue/bin/kue-dashboard -p 3050 -r redis://127.0.0.1:6379`
>
> from this folder.

> You may want to clear out `redis` before starting a new job, in which case access `redis-cli` and call `FLUSHALL`

> Do not run `get`, `update`, and `insert` at once, as this will hit the rate limit quickly.

> Do not user node version 10.7.0

> intro param sls invoke local -f processUpdate --data '{ "queryStringParameters": {"brand":"brand"}}'

> sls invoke local -f processInsert --data '{ "queryStringParameters": {"brand":"brand"}}'

> sls invoke local -f processInsertBrand --data '{ "queryStringParameters": {"brand":"brand"}}'
