module.exports.mapper = data => {
    return {
      type: "product",
      name: data.X,
      //Slug can not have spaces or foreign characters
      slug:
        data.X.replace(/[^A-Z0-9]/gi, "_"),
      status: "live",
      price: [
        {
          //placeholder upload price later
          amount: 0,
          currency: "USD",
          includes_tax: true
        }
      ],
      sku: data.X,
      manage_stock: false,
      commodity_type: "physical",
      description: data.X,
      // Used for catalog setup
      brand: data.X,
      // Add any custom data key value pairs
    };
  };
