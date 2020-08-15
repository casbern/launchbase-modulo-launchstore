const { formatPrice } = require('../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
  create(req,res) {
    // Pegar as categorias
    Category.all()
    .then(function(results) {
      const categories = results.rows

      return res.render('products/create.njk', { categories })

    }).catch(function(err) {
      throw new Error(err)
    })
  },

  async post(req,res) {
    // Logica para salvar
    const keys = Object.keys(req.body)

    for(key of keys) {
      if( req.body[key] == "") {
        return res.send("Please, fill all the gaps!")
      }
    }

    if(req.files.length == 0) {
      return res.send('Please, send at least one image')
    }

    let results = await Product.create(req.body) //* espera o await responder para continuar o programa.
    const productId = results.rows[0].id

    const filesPromise = req.files.map(file => File.create({...file, product_id: productId}))
    await Promise.all(filesPromise)

    console.log('req.files', req.files) 

    return res.redirect(`products/${productId}/edit`)
  },

  async edit(req, res) {
    let results = await Product.find(req.params.id) //* espera o await responder para continuar o programa.
    const product = results.rows[0]

    if(!product) return res.send("Product not found.")

    product.old_price = formatPrice(product.old_price)
    product.price = formatPrice(product.price)

    //get categories
    results = await Category.all()
    const categories = results.rows

    //get images
    results = await Product.files(product.id)
    let files = results.rows
    files = files.map( file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }))

    return res.render("products/edit.njk", { product, categories, files })
  },

  async put(req,res) {
    const keys = Object.keys(req.body)

    for(key of keys) {
      if( req.body[key] == "" && key != "removed_files") {
        return res.send("Please, fill all the gaps!")
      }
    }

    if(req.files.length != 0) {
      const newfilesPromise = req.files.map( file => {
        File.create({...file, product_id: req.body.id})
      })
      await Promise.all(newfilesPromise)
    }

    if(req.body.removed_files) {
      // Vem como uma string 1,2,3,
      const removedFiles = req.body.removed_files.split(",") // Vai ficar um array [1,2,3,]

      const lastIndex = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1) // Retorna [1,2,3]

      const removedFilesPromise = removedFiles.map(file => File.delete(id))

      await Promise.all(removedFilesPromise)
    }

    req.body.price = req.body.price.replace(/\D/g, "")

    if(req.body.old_price != req.body.price) {
      const oldProduct = await Product.find(req.body.id)
      req.body.old_price = oldProduct.rows[0].price
    }

    await Product.update(req.body)

    return res.redirect(`/products/${req.body.id}/edit`)
  },

  async delete(req,res) {
    await Product.delete(req.body.id)

    return res.redirect('/products/create')
  }
}