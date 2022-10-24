const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const { Rental} = require('../models/rental');
const mongoose = require('mongoose')
const {Movie} = require ('../models/movie')
const Joi = require('joi');
const validate = require('../middleware/validate')

router.post('/', [auth, validate(validateReturn)], async(req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId)

    if (!rental) return res.status(404).send('Rental not found');
    if (rental.dateReturned) return res.status(400).send('Rental processed');

    // Use transaction to save
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async() => {
            rental.return()
            await rental.save();
            await Movie.updateOne({_id: rental.movie._id}, {
                $inc: {numberInStock: 1}
            })
            res.send(rental)
        })

        session.endSession();
        console.log('success')
    } catch (error) {
        res.status(500).send('Something failed')
        session.endSession();

    }
});

function validateReturn(req) {
    const schema = Joi.object({
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
    });
  
    return schema.validate(req);
}

module.exports = router