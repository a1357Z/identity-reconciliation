const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('ajayyadav', 'ajayyadav', '08qJf4u4N6q08sG3Ui2OY0luvl7261At', {
  host: 'localhost',
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
