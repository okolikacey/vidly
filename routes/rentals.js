const auth = require('../middleware/auth')
require('dotenv').config()
const {Rental, validate} = require('../models/rental');
const {Movie} = require ('../models/movie')
const {Customer} = require ('../models/customer')
const Fawn = require('fawn'); //for two phase commit
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')


const dbInstance = process.env.DBINSTANCE

Fawn.init(dbInstance)

router.get('/', async(req, res) => {
    const rental = await Rental.find().sort('-dateOut');
    res.send(rental);
});

router.post('/', auth, async(req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customeer..')
  
    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie..')

    if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock')

    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        }, 
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    
    //Use transaction to save
    try {
        const session = await mongoose.startSession();
        await session.withTransaction(async() => {
            const result = await rental.save();
            movie.numberInStock--;
            movie.save();
            res.send(result)
        })

        session.endSession();
        console.log('success')
    } catch (error) {
        res.status(500).send('Something failed')
        session.endSession();

    }
    
});
  
router.get('/:id', async(req, res) => {
    const rental = await Rental.findById(req.params.id)

    if (!rental) return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});

module.exports = router;