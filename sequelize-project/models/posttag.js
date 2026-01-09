'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostTag extends Model {
    /**
     * Define associations here.
     * This is a junction table for Many-to-Many relationship
     */
    static associate(models) {
      // PostTag belongs to Post
      PostTag.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // PostTag belongs to Tag
      PostTag.belongsTo(models.Tag, {
        foreignKey: 'tagId',
        as: 'tag',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  PostTag.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      }
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PostTag',
    tableName: 'PostTags',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['postId', 'tagId'], // Composite unique index
        name: 'unique_post_tag'
      }
    ]
  });

  return PostTag;
};