const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'postgres',
  port: 5432,
  // Additional options
});

const Contact = sequelize.define('contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'emailPhoneNumberComposite'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'emailPhoneNumberComposite'
    },
    linkedId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    linkPrecedence: {
      type: DataTypes.ENUM('primary', 'secondary'),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true // enables soft deletes
  });

module.exports = {
    sequelize,
    Contact
};
