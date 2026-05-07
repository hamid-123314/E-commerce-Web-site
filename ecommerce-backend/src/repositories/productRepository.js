const products = require('../data/products');

function findAll() {
  return products;
}

function findById(id) {
  return products.find((product) => product.id === id);
}

module.exports = {
  findAll,
  findById,
};
