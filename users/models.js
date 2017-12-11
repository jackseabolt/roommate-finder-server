'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique:true},
  password: { type: String, required: true},
  firstName: { type: String },
  lastName: { type: String },
  city: { type: String },
  state: { type: String },
  age: {type: Number},
  max_distance: { type: Number },
  max_price: { type: Number }, 
  pets_have: { type: Boolean },
  pets_bothered: { type: Number }, 
  loud_music: { type: Boolean },
  loud_music_bothered: { type: Number },
  cigarettes: { type: Boolean },
  cigarettes_bothered: { type: Boolean },
  drinking_day_per_week: { type: String },
  drinking_bothered: { type: Number },
  alt_smoking: { type: Boolean },
  alt_smoking_bothered: { type: Number },
  hour_awake: { type: String },
  hours_bothered: { type: Number },
  guests_frequency: { type: Number },
  guests_bothered: { type: Number },
  cleanliness: { type: Number },
  cleanliness_bothered: { type: Number },
  gender: { type: String },
  gender_bothered: { type: Boolean }, 
  bio: { type: String }, 
  interests: { type: String }, 
  music: { type: String }, 
  movies: { type: String }, 
  tv: { type: String }

});

UserSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username, 
    city: this.city, 
    state: this.state, 
    age: this.age,
    bio: this.bio, 
    interests: this.interests, 
    music: this.music, 
    movies: this.movies, 
    tv: this.tv
  };
};

UserSchema.methods.validatePassword = function (password){
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password){
  return bcrypt.hash(password, 10);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = {User};