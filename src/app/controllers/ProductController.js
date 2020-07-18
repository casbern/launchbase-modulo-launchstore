const Category = require('../models/Category')

module.exports = {
  create(req,res) {
    // Pegar as categorias
    return res.render('products/create.njk')
  },

  post(req,res) {
    // Logica para salvar
  }
}