## Import Moltin Products

## Pre-requisites
1. NodeJS (10.0.0 or newer)
2. Npm (6.0.0 or newer)
3. Redis
4. Moltin store
5. CSV containing your products

## 🛠 Setup
```bash
npm install -g @moltin/importer
importer
```

## ⛽️ Usage
Before running, please make sure your CSV includes columns with the following names:
slug, sku, name, description and price. You can leave in any additional columns and those will be created as flow fields.

When running, the CLI will prompt you for the path to your CSV, as well as your moltin credentials and your redis port + host if not using the defaults.

Once the import app has started, you can navigate to http://localhost:4567 in your web browser where you will see a neat web UI for observing the import. This UI runs using https://github.com/bee-queue/arena.

To begin the import, simply GET localhost:4000

**If you are re-running an import, you should run `redis-cli FLUSHALL` on a new command line tab in order to  make sure any old jobs are flushed from Redis.**

## ⚡️ Internals
Two express apps are automatically started for you:

1. Producer (port 4000).
This is responsible for parsing your CSV and creating jobs for each of the products within it

2. Consumer (port 3000)
The consumer is responsible for reacting to incoming jobs. If they are jobs from the producer, it will check if those products exist already in Moltin. It will raise a new job for each product according to the result (update or insert). It will then process these new jobs itself and run the actual addition or updates in Moltin for you.