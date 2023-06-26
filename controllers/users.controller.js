const { v4: uuid } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

let DUMMY_USERS = [
  {
    id: 'p1',
    name: 'Davi Seagull',
    email: 'test@test.com',
    password: '1234',
  },
];

const getAllUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    next(new HttpError('Could not create user, email already exists', 422));
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const user = DUMMY_USERS.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return next(
      new HttpError(
        ' Could not identify user, credentials seem to be wrong',
        201
      )
    );
  }

  res.json({ message: 'Logged In' });
};

exports.getUsers = getAllUsers;
exports.signUp = signUp;
exports.login = login;
