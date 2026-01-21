'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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

  async down (queryInterface, Sequelize) {
    // Delete in reverse order to handle foreign key constraints
    await queryInterface.bulkDelete('PostTags', null, {});
    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('Posts', null, {});
    await queryInterface.bulkDelete('Profiles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
