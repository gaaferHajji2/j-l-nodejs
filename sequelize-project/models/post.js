'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Define associations here.
     * Many-to-One: Post belongs to User
     * Many-to-Many: Post has many Tags through PostTags
     */
    static associate(models) {
      // Post belongs to a User
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author', // Alias for eager loading
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Many-to-Many relationship with Tags
      Post.belongsToMany(models.Tag, {
        through: models.PostTag, // Junction table
        foreignKey: 'postId',
        otherKey: 'tagId',
        as: 'tags', // Alias for eager loading
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Post.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, 200],
          msg: 'Title must be between 5 and 200 characters'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [10, 5000],
          msg: 'Content must be between 10 and 5000 characters'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts',
    timestamps: true
  });

  return Post;
};