'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Define associations here.
     * One-to-One: Profile belongs to User
     */
    static associate(models) {
      // Profile belongs to a single User
      Profile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Alias for eager loading
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Profile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Ensures one-to-one relationship
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: 'First name must be between 2 and 50 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 50],
          msg: 'Last name must be between 2 and 50 characters'
        }
      }
    },
    bio: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Bio cannot exceed 1000 characters'
        }
      }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      validate: {
        isDate: {
          msg: 'Please provide a valid date'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
    timestamps: true
  });

  return Profile;
};