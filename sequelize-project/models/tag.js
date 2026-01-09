'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Define associations here.
     * Many-to-Many: Tag has many Posts through PostTags
     */
    static associate(models) {
      // Many-to-Many relationship with Posts
      Tag.belongsToMany(models.Post, {
        through: models.PostTag, // Junction table
        foreignKey: 'tagId',
        otherKey: 'postId',
        as: 'posts', // Alias for eager loading
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Tag.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Tag name already exists'
      },
      validate: {
        len: {
          args: [2, 50],
          msg: 'Tag name must be between 2 and 50 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Description cannot exceed 500 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags',
    timestamps: true
  });

  return Tag;
};