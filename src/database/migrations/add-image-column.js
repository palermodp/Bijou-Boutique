'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'image', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'default-user.png'  // Puedes cambiar esto por tu imagen por defecto
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'image');
  }
};