I'll create a comprehensive Node.js with Sequelize example covering all your requirements. Let me break this down into parts.

## **Project Structure**
```
sequelize-project/
├── src/
│   ├── models/
│   ├── migrations/
│   ├── seeders/
│   ├── config/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   └── routes/
├── .sequelizerc
└── package.json
```

## **1. Package.json**
```json
{
  "name": "sequelize-relations-example",
  "version": "1.0.0",
  "description": "Sequelize with all relation types",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all",
    "model:generate": "npx sequelize-cli model:generate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4"
  },
  "devDependencies": {
    "sequelize-cli": "^6.6.1",
    "nodemon": "^3.0.1"
  }
}
```

## **2. .sequelizerc (Configuration for CLI)**
```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src/config', 'config.json'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

## **3. Database Configuration (src/config/config.json)**
```json
{
  "development": {
    "username": "postgres",
    "password": "password",
    "database": "sequelize_relations_dev",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  },
  "test": {
    "username": "postgres",
    "password": "password",
    "database": "sequelize_relations_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": "password",
    "database": "sequelize_relations_prod",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

## **4. Migration Files**

### **User Migration (One-to-One with Profile)**
```bash
# Command to generate migration:
# npx sequelize-cli migration:generate --name create-users-table
```

```javascript
// src/migrations/20231001000001-create-users-table.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
```

### **Profile Migration (One-to-One with User)**
```javascript
// src/migrations/20231001000002-create-profiles-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // Ensures one-to-one relationship
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT
      },
      dateOfBirth: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
  }
};
```

### **Post Migration (One-to-Many: User has many Posts)**
```javascript
// src/migrations/20231001000003-create-posts-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};
```

### **Tag Migration (Many-to-Many with Posts)**
```javascript
// src/migrations/20231001000004-create-tags-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tags');
  }
};
```

### **PostTags Junction Table (Many-to-Many)**
```javascript
// src/migrations/20231001000005-create-post-tags-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostTags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add unique constraint to prevent duplicate associations
    await queryInterface.addConstraint('PostTags', {
      fields: ['postId', 'tagId'],
      type: 'unique',
      name: 'unique_post_tag'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PostTags');
  }
};
```

## **5. Models with Relations**

### **User Model (src/models/user.js)**
```javascript
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
```

### **Profile Model (src/models/profile.js)**
```javascript
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
```

### **Post Model (src/models/post.js)**
```javascript
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
```

### **Tag Model (src/models/tag.js)**
```javascript
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
```

### **PostTag Model (Junction Table)**
```javascript
// src/models/posttag.js
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
```

### **Models Index File**
```javascript
// src/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Read all model files
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

## **6. Repository Pattern**

### **Base Repository**
```javascript
// src/repositories/base.repository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return await this.model.findOne({ where, ...options });
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const instance = await this.findById(id);
    if (!instance) return null;
    
    return await instance.update(data, options);
  }

  async delete(id, options = {}) {
    const instance = await this.findById(id);
    if (!instance) return false;
    
    await instance.destroy(options);
    return true;
  }

  async paginate(page = 1, limit = 10, options = {}) {
    const offset = (page - 1) * limit;
    const result = await this.model.findAndCountAll({
      ...options,
      limit,
      offset,
      distinct: true
    });
    
    return {
      data: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit)
      }
    };
  }
}

module.exports = BaseRepository;
```

### **User Repository**
```javascript
// src/repositories/user.repository.js
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super(require('../models').User);
  }

  // Get all users with only specific columns for listing
  async findAllUsers(includeAssociations = false) {
    const options = {
      attributes: ['id', 'username', 'email', 'createdAt'], // Only necessary columns
      order: [['createdAt', 'DESC']]
    };

    if (includeAssociations) {
      options.include = [
        {
          model: require('../models').Profile,
          as: 'profile',
          attributes: ['firstName', 'lastName'] // Only specific columns from profile
        },
        {
          model: require('../models').Post,
          as: 'posts',
          attributes: ['id', 'title', 'isPublished'], // Only specific columns from posts
          required: false // LEFT JOIN instead of INNER JOIN
        }
      ];
    }

    return await this.findAll(options);
  }

  // Get user by ID with all detailed information
  async findUserById(id) {
    return await this.findById(id, {
      include: [
        {
          model: require('../models').Profile,
          as: 'profile'
          // All columns from profile (no attributes specified)
        },
        {
          model: require('../models').Post,
          as: 'posts',
          include: [
            {
              model: require('../models').Tag,
              as: 'tags',
              through: { attributes: [] } // Hide junction table attributes
            }
          ]
        }
      ]
    });
  }

  async findUserWithPosts(id) {
    return await this.findById(id, {
      attributes: ['id', 'username', 'email'],
      include: [
        {
          model: require('../models').Post,
          as: 'posts',
          attributes: ['id', 'title', 'createdAt'],
          where: { isPublished: true }
        }
      ]
    });
  }

  async findUsersByEmail(email) {
    return await this.findAll({
      where: { email },
      attributes: ['id', 'username', 'email']
    });
  }
}

module.exports = new UserRepository();
```

### **Post Repository**
```javascript
// src/repositories/post.repository.js
const BaseRepository = require('./base.repository');

class PostRepository extends BaseRepository {
  constructor() {
    super(require('../models').Post);
  }

  // Get all posts with only specific columns
  async findAllPosts() {
    return await this.findAll({
      attributes: ['id', 'title', 'isPublished', 'createdAt', 'userId'],
      include: [
        {
          model: require('../models').User,
          as: 'author',
          attributes: ['id', 'username'] // Only specific columns from user
        },
        {
          model: require('../models').Tag,
          as: 'tags',
          attributes: ['id', 'name'], // Only specific columns from tags
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Get post by ID with all detailed information
  async findPostById(id) {
    return await this.findById(id, {
      include: [
        {
          model: require('../models').User,
          as: 'author',
          include: [
            {
              model: require('../models').Profile,
              as: 'profile'
            }
          ]
        },
        {
          model: require('../models').Tag,
          as: 'tags'
        }
      ]
    });
  }

  async findPublishedPosts(page = 1, limit = 10) {
    return await this.paginate(page, limit, {
      where: { isPublished: true },
      attributes: ['id', 'title', 'createdAt'],
      include: [
        {
          model: require('../models').User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async addTagsToPost(postId, tagIds) {
    const post = await this.findById(postId);
    if (!post) return null;
    
    await post.setTags(tagIds);
    return await this.findPostById(postId);
  }
}

module.exports = new PostRepository();
```

## **7. Service Layer**

### **User Service**
```javascript
// src/services/user.service.js
const userRepository = require('../repositories/user.repository');
const postRepository = require('../repositories/post.repository');

class UserService {
  // Get all users with minimal data
  async getAllUsers() {
    return await userRepository.findAllUsers();
  }

  // Get user by ID with all details
  async getUserById(id) {
    const user = await userRepository.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Create new user with profile
  async createUser(userData, profileData) {
    const { username, email } = userData;
    
    // Check if user already exists
    const existingUser = await userRepository.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [{ username }, { email }] 
      } 
    });
    
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Create user with profile using transaction
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const user = await userRepository.create(userData, { transaction });
      
      if (profileData) {
        await require('../models').Profile.create(
          { ...profileData, userId: user.id },
          { transaction }
        );
      }
      
      await transaction.commit();
      return await userRepository.findUserById(user.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update user
  async updateUser(id, userData, profileData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const transaction = await require('../models').sequelize.transaction();
    
    try {
      // Update user
      if (Object.keys(userData).length > 0) {
        await userRepository.update(id, userData, { transaction });
      }

      // Update profile
      if (profileData) {
        const profile = await require('../models').Profile.findOne({
          where: { userId: id },
          transaction
        });
        
        if (profile) {
          await profile.update(profileData, { transaction });
        } else {
          await require('../models').Profile.create(
            { ...profileData, userId: id },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return await userRepository.findUserById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Delete user (cascade will delete profile and posts)
  async deleteUser(id) {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  // Get user's posts
  async getUserPosts(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return await postRepository.findAll({
      where: { userId },
      attributes: ['id', 'title', 'isPublished', 'createdAt']
    });
  }
}

module.exports = new UserService();
```

### **Post Service**
```javascript
// src/services/post.service.js
const postRepository = require('../repositories/post.repository');
const userRepository = require('../repositories/user.repository');

class PostService {
  // Get all posts with minimal data
  async getAllPosts() {
    return await postRepository.findAllPosts();
  }

  // Get post by ID with all details
  async getPostById(id) {
    const post = await postRepository.findPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  // Create new post
  async createPost(postData) {
    // Verify user exists
    const user = await userRepository.findById(postData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await postRepository.create(postData);
  }

  // Update post
  async updatePost(id, postData) {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    return await postRepository.update(id, postData);
  }

  // Delete post
  async deletePost(id) {
    const deleted = await postRepository.delete(id);
    if (!deleted) {
      throw new Error('Post not found');
    }
    return { message: 'Post deleted successfully' };
  }

  // Add tags to post (Many-to-Many relationship)
  async addTagsToPost(postId, tagIds) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Verify all tags exist
    const Tag = require('../models').Tag;
    const tags = await Tag.findAll({
      where: { id: tagIds }
    });

    if (tags.length !== tagIds.length) {
      throw new Error('One or more tags not found');
    }

    return await postRepository.addTagsToPost(postId, tagIds);
  }

  // Get published posts with pagination
  async getPublishedPosts(page = 1, limit = 10) {
    return await postRepository.findPublishedPosts(page, limit);
  }
}

module.exports = new PostService();
```

## **8. Controllers**

### **User Controller**
```javascript
// src/controllers/user.controller.js
const userService = require('../services/user.service');

class UserController {
  // Get all users (returns only necessary columns)
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by ID (returns all detailed information)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      res.json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const { user, profile } = req.body;
      const newUser = await userService.createUser(user, profile);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { user, profile } = req.body;
      const updatedUser = await userService.updateUser(id, user, profile);
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      
      res.json({
        success: true,
        data: result,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's posts
  async getUserPosts(req, res) {
    try {
      const { id } = req.params;
      const posts = await userService.getUserPosts(id);
      
      res.json({
        success: true,
        data: posts,
        message: 'User posts retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
```

### **Post Controller**
```javascript
// src/controllers/post.controller.js
const postService = require('../services/post.service');

class PostController {
  // Get all posts (returns only necessary columns)
  async getAllPosts(req, res) {
    try {
      const posts = await postService.getAllPosts();
      res.json({
        success: true,
        data: posts,
        message: 'Posts retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get post by ID (returns all detailed information)
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);
      
      res.json({
        success: true,
        data: post,
        message: 'Post retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new post
  async createPost(req, res) {
    try {
      const post = await postService.createPost(req.body);
      
      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.updatePost(id, req.body);
      
      res.json({
        success: true,
        data: post,
        message: 'Post updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const result = await postService.deletePost(id);
      
      res.json({
        success: true,
        data: result,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add tags to post (Many-to-Many relationship)
  async addTagsToPost(req, res) {
    try {
      const { id } = req.params;
      const { tagIds } = req.body;
      
      if (!Array.isArray(tagIds)) {
        return res.status(400).json({
          success: false,
          message: 'tagIds must be an array'
        });
      }
      
      const post = await postService.addTagsToPost(id, tagIds);
      
      res.json({
        success: true,
        data: post,
        message: 'Tags added to post successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get published posts with pagination
  async getPublishedPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await postService.getPublishedPosts(page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Published posts retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PostController();
```

## **9. Routes**

```javascript
// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/user.controller');
const postController = require('../controllers/post.controller');

// User routes
router.get('/users', userController.getAllUsers); // Get all users (minimal data)
router.get('/users/:id', userController.getUserById); // Get user by ID (detailed)
router.post('/users', userController.createUser); // Create user with profile
router.put('/users/:id', userController.updateUser); // Update user and profile
router.delete('/users/:id', userController.deleteUser); // Delete user (cascade)
router.get('/users/:id/posts', userController.getUserPosts); // Get user's posts

// Post routes
router.get('/posts', postController.getAllPosts); // Get all posts (minimal data)
router.get('/posts/published', postController.getPublishedPosts); // Get published posts
router.get('/posts/:id', postController.getPostById); // Get post by ID (detailed)
router.post('/posts', postController.createPost); // Create post
router.put('/posts/:id', postController.updatePost); // Update post
router.delete('/posts/:id', postController.deletePost); // Delete post
router.post('/posts/:id/tags', postController.addTagsToPost); // Add tags to post (Many-to-Many)

module.exports = router;
```

## **10. Server File**

```javascript
// src/server.js
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (optional - use migrations for production)
    // await sequelize.sync({ alter: true });
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
```

## **11. Seeders (Optional)**

```javascript
// src/seeders/20231001000001-demo-data.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    const users = await queryInterface.bulkInsert('Users', [
      {
        username: 'john_doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Insert profiles
    await queryInterface.bulkInsert('Profiles', [
      {
        userId: users[0].id,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer',
        dateOfBirth: new Date('1990-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: users[1].id,
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Web designer',
        dateOfBirth: new Date('1992-05-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert posts
    const posts = await queryInterface.bulkInsert('Posts', [
      {
        title: 'Getting Started with Sequelize',
        content: 'This is a comprehensive guide to Sequelize...',
        userId: users[0].id,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Understanding Database Relations',
        content: 'In this post, we explore different relation types...',
        userId: users[0].id,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Advanced Sequelize Patterns',
        content: 'Learn about repositories and services...',
        userId: users[1].id,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Insert tags
    const tags = await queryInterface.bulkInsert('Tags', [
      {
        name: 'Node.js',
        description: 'JavaScript runtime',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Database',
        description: 'Database related topics',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ORM',
        description: 'Object-Relational Mapping',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Insert PostTags (Many-to-Many)
    await queryInterface.bulkInsert('PostTags', [
      {
        postId: posts[0].id,
        tagId: tags[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        postId: posts[0].id,
        tagId: tags[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        postId: posts[1].id,
        tagId: tags[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        postId: posts[2].id,
        tagId: tags[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        postId: posts[2].id,
        tagId: tags[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order to handle foreign key constraints
    await queryInterface.bulkDelete('PostTags', null, {});
    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('Posts', null, {});
    await queryInterface.bulkDelete('Profiles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
```

## **12. Commands**

### **Installation & Setup Commands**
```bash
# Initialize project
npm init -y

# Install dependencies
npm install express sequelize pg pg-hstore
npm install --save-dev sequelize-cli nodemon

# Initialize Sequelize
npx sequelize-cli init

# Create database (PostgreSQL)
createdb sequelize_relations_dev
createdb sequelize_relations_test
createdb sequelize_relations_prod
```

### **Model Generation Commands**
```bash
# Generate User model with migration
npx sequelize-cli model:generate --name User --attributes username:string,email:string

# Generate Profile model with migration
npx sequelize-cli model:generate --name Profile --attributes userId:integer,firstName:string,lastName:string,bio:text,dateOfBirth:date

# Generate Post model with migration
npx sequelize-cli model:generate --name Post --attributes title:string,content:text,userId:integer,isPublished:boolean

# Generate Tag model with migration
npx sequelize-cli model:generate --name Tag --attributes name:string,description:text

# Generate PostTag model (junction table) with migration
npx sequelize-cli model:generate --name PostTag --attributes postId:integer,tagId:integer

# Generate migration only
npx sequelize-cli migration:generate --name add-column-to-table
```

### **Migration Commands**
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Run specific migration
npx sequelize-cli db:migrate --name 20231001000001-create-users-table.js

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

### **Seeder Commands**
```bash
# Generate seeder
npx sequelize-cli seed:generate --name demo-data

# Run all seeders
npx sequelize-cli db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed 20231001000001-demo-data.js

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed 20231001000001-demo-data.js
```

### **Database Commands**
```bash
# Create database
npx sequelize-cli db:create

# Drop database
npx sequelize-cli db:drop

# Reset database (drop, create, migrate)
npx sequelize-cli db:migrate:reset
```

## **13. API Examples**

### **User API Examples**
```bash
# Get all users (returns minimal data)
GET /api/users

# Get user by ID (returns detailed information)
GET /api/users/1

# Create user with profile (One-to-One relationship)
POST /api/users
Content-Type: application/json

{
  "user": {
    "username": "alex_jones",
    "email": "alex@example.com"
  },
  "profile": {
    "firstName": "Alex",
    "lastName": "Jones",
    "bio": "Full stack developer"
  }
}

# Update user and profile
PUT /api/users/1
Content-Type: application/json

{
  "user": {
    "email": "updated@example.com"
  },
  "profile": {
    "bio": "Updated bio information"
  }
}

# Get user's posts (One-to-Many relationship)
GET /api/users/1/posts

# Delete user (cascade deletes profile and posts)
DELETE /api/users/1
```

### **Post API Examples**
```bash
# Get all posts (returns minimal data)
GET /api/posts

# Get post by ID (returns detailed information)
GET /api/posts/1

# Create post
POST /api/posts
Content-Type: application/json

{
  "title": "New Post Title",
  "content": "Post content here...",
  "userId": 1,
  "isPublished": true
}

# Add tags to post (Many-to-Many relationship)
POST /api/posts/1/tags
Content-Type: application/json

{
  "tagIds": [1, 2, 3]
}

# Get published posts with pagination
GET /api/posts/published?page=1&limit=10
```

## **Key Features Demonstrated**

1. **All Relationship Types:**
   - One-to-One: User ↔ Profile
   - One-to-Many: User → Posts
   - Many-to-Many: Posts ↔ Tags (through PostTags junction table)

2. **Optimized Data Retrieval:**
   - `GET /api/users`: Returns only `id, username, email, createdAt`
   - `GET /api/users/:id`: Returns all user details with nested associations
   - Same pattern for posts

3. **Design Patterns:**
   - Repository Pattern: Abstract database operations
   - Service Layer: Business logic separation
   - MVC Pattern: Controllers handle HTTP requests

4. **Migration Management:**
   - Complete migration files for all tables
   - Foreign key constraints and indexes
   - Proper table relationships

5. **Best Practices:**
   - Transaction management
   - Error handling
   - Input validation
   - Pagination support
   - Clean separation of concerns

This implementation provides a robust foundation for a Sequelize-based Node.js application with all relationship types properly implemented and optimized data retrieval strategies.