'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique:true},
  password: { type: String, required: true},
  firstName: { type: String },
  lastName: { type: String },
  address: {type: String},
  zipcode: {type: Number},
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
  cigarettes_bothered: { type: Number },
  common_areas: {type: Boolean},
  common_areas_bothered: {type: Number},
  drinking_day_per_week: { type: Boolean },
  drinking_bothered: { type: Number },
  alt_smoking: { type: Boolean },
  alt_smoking_bothered: { type: Number },
  hour_awake: { type: Boolean },
  hours_bothered: { type: Number },
  guests_frequency: { type: Boolean },
  guests_bothered: { type: Number },
  cleanliness: { type: Boolean },
  cleanliness_bothered: { type: Number },
  gender: { type: String },
  gender_bothered: { type: Number }, 
  bio: { type: String }, 
  interests: { type: String }, 
  music: { type: String }, 
  movies: { type: String }, 
  tv: { type: String },
  looking_for: { type: String },
  score: {type: Number},
  lat: {type: Number},
  long: {type: Number},
  conversations: [
    {
      conversation: {type: String},
      other_user: {type: String}
    }
  ],
  picture: {type: String},
  email: {type: String}
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
    max_distance: this.max_distance,
    max_price: this.max_price, 
    pets_have: this.pets_have,
    pets_bothered: this.pets_bothered, 
    loud_music: this.loud_music,
    loud_music_bothered: this.loud_music_bothered,
    cigarettes: this.cigarettes,
    cigarettes_bothered: this.cigarettes_bothered,
    drinking_day_per_week: this.drinking_day_per_week,
    drinking_bothered: this.drinking_bothered,
    alt_smoking: this.alt_smoking,
    alt_smoking_bothered: this.alt_smoking_bothered,
    hour_awake: this.hours_awake,
    hours_bothered: this.hours_bothered,
    guests_frequency: this.guests_frequency,
    guests_bothered: this.guests_bothered,
    cleanliness: this.cleanliness,
    cleanliness_bothered: this.cleanliness_bothered,
    gender: this.gender,
    gender_bothered: this.gender_bothered, 
    interests: this.interests, 
    music: this.music, 
    common_areas: this.common_areas,
    common_areas_bothered: this.common_areas_bothered,
    movies: this.movies, 
    tv: this.tv, 
    looking_for: this.looking_for, 
    picture: this.picture,
    conversations: this.conversations,
    lat: this.lat,
    long: this.long,
    email: this.email
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