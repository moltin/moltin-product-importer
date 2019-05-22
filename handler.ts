const csv = require("fast-csv")
const map = require('./map.ts')
const MoltinGateway = require("./moltin.js").gateway

const Moltin = MoltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET
})

const fs = require("fs");
const kue = require("kue");
const jobQueue = kue.createQueue();
let handlerCallback;
let shouldPauseQueue = false;

const csvLocation = process.env.CSV_LOCATION;

export const processGet = async (event, context, callback) => {
  handlerCallback = callback;

  console.log("Parsing products CSV");
  const products: any[] = await getProductsFromCSV(csvLocation);
  console.log(`${products.length} products parsed`);

  await addProductsToGetQueue(products);
  processGetJobs();
};

export const processUpdate = async (event, context, callback) => {
  processUpdateJobs();
};
export const processInsert = async (event, context, callback) => {
  processInsertJobs();
};

export const analyze = async (event, context, callback) => {
  console.log("Parsing products CSV");
  const products: any[] = await getProductsFromCSV(csvLocation);
  console.log(`${products.length} products parsed`);
};

const shutdownQueue = () => {
  jobQueue.shutdown(5000, err => {
    console.log("Kue shutdown: ", err || "no error");
    handlerCallback(null, "Done");
  });
};

const processGetJobs = () => {
  //get a list of products, 3 at a time
  jobQueue.process("get-product", 5, async (job, ctx, done) => {
    if (shouldPauseQueue) {
      ctx.pause(15000, err => {
        console.log("Waiting 15 seconds...");
        setTimeout(function() {
          shouldPauseQueue = false;
          ctx.resume();
        }, 15000);
      });
    }

    try {
      const {
        data: { product }
      } = job;

      //see if the product exisit based on sku
      console.log(`Get product ${product.sku}`);
      //either update or insert
      const products = await getProduct(product.sku);
      if (products.length > 0) {
        const existingProduct = products[0];
        product["id"] = existingProduct["id"];
        console.log("Adding product to update queue");
        await addProductToUpdateQueue(product);
      } else {
        console.log("Adding product to insert queue");
        addProductToInsertQueue(product);
      }
      done();
    } catch (error) {
      console.log(error);
      done(JSON.stringify(error));
    }
  });
};

const processUpdateJobs = () => {
  jobQueue.process("update-product", 3, async (job, ctx, done) => {
    if (shouldPauseQueue) {
      ctx.pause(15000, err => {
        console.log("Waiting 15 seconds...");
        setTimeout(function() {
          shouldPauseQueue = false;
          ctx.resume();
        }, 15000);
      });
    }
    try {
      const {
        data: { updatedProduct }
      } = job;

      console.log(`Update product ${updatedProduct.sku}`);
      await updateProduct(updatedProduct);
      done();
    } catch (error) {
      console.log(error);
      done(JSON.stringify(error));
    }
  });
};

const processInsertJobs = () => {
  jobQueue.process("insert-product", 20, async (job, ctx, done) => {
    if (shouldPauseQueue) {
      ctx.pause(15000, err => {
        console.log("Waiting 15 seconds...");
        setTimeout(function() {
          shouldPauseQueue = false;
          ctx.resume();
        }, 15000);
      });
    }
    try {
      const {
        data: { product }
      } = job;

      const createdProduct = await insertProduct(product);
      console.log("product id", createdProduct.data.id);
      done();
    } catch (error) {
      console.log(error);
      done(JSON.stringify(error));
    }
  });
};

//moltin API calls
const getProduct = async (product): Promise<any[]> => {
  return Moltin.Products.Filter({ eq: { sku: product } })
    .All()
    .then(data => data.data);
};

const updateProduct = async product => {
  console.log(`Updating ID: ${product.id}`);
  return Moltin.Products.Update(product.id, product);
};

const insertProduct = async product => {
  console.log(`Inserting product: ${product.sku}`);
  return Moltin.Products.Create(product);
};

const addProductToGetQueue = async product => {
  console.log(product)

  jobQueue
    .create("get-product", {
      title: `Getting product ${product.sku}`,
      product
    })
    .on("failed", errorMessage => {
      console.log("Get failed");
      const {
        errors: [{ status }]
      } = JSON.parse(errorMessage);

      if (status == 429) {
        console.log("Rate limit hit");
        // Backoff queue
        shouldPauseQueue = true;
        // Re-add job
        addProductToGetQueue(product);
      }
    })
    .save();
};

const addProductToInsertQueue = async product => {
  jobQueue
    .create("insert-product", {
      title: `Inserting product ${product.sku}`,
      product
    })
    .on("failed", errorMessage => {
      console.log("Insert failed");
      const {
        errors: [{ status }]
      } = JSON.parse(errorMessage);

      if (status == 429) {
        console.log("Rate limit hit");
        // Backoff queue
        shouldPauseQueue = true;
        // Re-add job
        addProductToInsertQueue(product);
      }
    })
    .save();
};

const addProductToUpdateQueue = async updatedProduct => {
  jobQueue
    .create("update-product", {
      title: `Updating product ${updatedProduct.sku}`,
      updatedProduct
    })
    .on("failed", errorMessage => {
      console.log("Update failed");
      const {
        errors: [{ status }]
      } = JSON.parse(errorMessage);

      if (status == 429) {
        console.log("Rate limit hit");
        // Backoff queue
        shouldPauseQueue = true;
        // Re-add job
        addProductToUpdateQueue(updatedProduct);
      }
    })
    .save();
};

const addProductsToGetQueue = async products => {
  for (let i = 0, len = products.length; i < len; i++) {
    const product = products[i];
    addProductToGetQueue(product);
  }
};

const addProductsToUpdateQueue = async products => {
  for (let i = 0, len = products.length; i < len; i++) {
    const product = products[i];
    addProductToUpdateQueue(product);
  }
};

const addProductToRelationshipQueue = async product => {
  jobQueue
    .create("product-relationships", {
      title: `Product ${product.product_id}`,
      product
    })
    .on("failed", errorMessage => {
      console.log("Get failed");
      const {
        errors: [{ status }]
      } = JSON.parse(errorMessage);

      if (status == 429) {
        console.log("Rate limit hit");
        // Backoff queue
        shouldPauseQueue = true;
        // Re-add job
        addProductToRelationshipQueue(product);
      }
    })
    .save();
};

const getProductsFromCSV = async (fileLocation): Promise<any[]> => {
  let resolveCallback;
  const promise = new Promise<any[]>((resolve, reject) => {
    resolveCallback = resolve;
  });

  const objects: any[] = [];

  const reader = csv({
    headers: true,
    objectMode: true,
    ignoreEmpty: true,
  });

  const productsStream = fs.createReadStream(fileLocation);
  const csvStream = reader
    .transform(item => {
      return map.productDataMapper(item);
    })
    .on("data", data => objects.push(data))
    .on("error", function(data){
      return false;                         
    })
    .on("end", () => {
      console.log(objects)
      resolveCallback(objects);
    });
  productsStream.pipe(csvStream);

  return promise;
};
