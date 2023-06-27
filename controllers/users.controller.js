const { v4: uuid } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (error) {
    return next(
      new HttpError('Fetching users failed, please try again later.', 500)
    );
  }

  res.json({ users: users.map((user) => user.toObject()) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError('User exists already, please login instead', 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(
      new HttpError('Signing up failed, please try again later.'),
      500
    );
  }

  res.status(201).json({ user: createdUser.toObject() });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  if (!user || user.password !== password) {
    return next(
      new HttpError(
        ' Could not identify user, credentials seem to be wrong',
        401
      )
    );
  }

  res.json({ message: 'Logged In' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
