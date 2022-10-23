const mongoose = require('mongoose')
const Joi = require('joi');


const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phone: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    isGold: {type: Boolean, default: false}
})

const Customer = mongoose.model('Customer', customerSchema)

function validateCustomer(customer) {
    const schema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      isGold: Joi.boolean(),
      phone: Joi.string().min(5).max(50).required()
    });
  
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
