'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Define associations here.
     * One-to-One: User has one Profile
     * One-to-Many: User has many Posts
     */
    static associate(models) {
      // One-to-One relationship with Profile
      User.hasOne(models.Profile, {
        foreignKey: 'userId',
        as: 'profile', // Alias for eager loading
        onDelete: 'CASCADE', // Delete profile when user is deleted
        onUpdate: 'CASCADE'
      });

      // One-to-Many relationship with Posts
      User.hasMany(models.Post, {
        foreignKey: 'userId',
        as: 'posts', // Alias for eager loading
        onDelete: 'CASCADE', // Delete all posts when user is deleted
        onUpdate: 'CASCADE'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Username already exists'
      },
      validate: {
        len: {
          args: [3, 30],
          msg: 'Username must be between 3 and 30 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    paranoid: false // Set to true if you want soft deletes
  });

  return User;
};