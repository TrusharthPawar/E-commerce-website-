const mongoose = require('mongoose')


const womens_cloths = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    id: Number,
    title: String,
    brand: String,
    price: Number,
    img:String
})

module.exports = mongoose.model('womens_cloths',womens_cloths)