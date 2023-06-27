const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided place id.', 404)
    );
  }

  res.json({ place: place.toObject() });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a place for the provided user  id.', 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject()),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, description, coordinates, address, creator } = req.body;

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError('Creating place failed, please try again later.')
    );
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id.'));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not save place.'),
      500
    );
  }
  res.status(201).json({ place: createdPlace.toObject() });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await place.deleteOne({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError('Something went wrong, could not delete a place.', 500)
    );
  }

  res.status(200).json({ message: 'Deleted place.' });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided place id.', 404)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not update place.'),
      500
    );
  }
  res.status(200).json({ place: place.toObject() });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
