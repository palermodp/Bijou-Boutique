module.exports = (sequelize, DataTypes) => {
  let alias = "User";
  let cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(95),
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING(95),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(95),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING(95),
      allowNull: false,
      defaultValue: "user",
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "default-user.png",
    },
  };
  let config = {
    timestamps: false,
    tableName: "users",
    paranoid: false,
  };
  const User = sequelize.define(alias, cols, config);

  User.associate = function (models) {
    User.hasMany(models.Order, {
      as: "orders",
      foreignKey: "id_user",
    });
    User.hasMany(models.Cart, {
      as: "carts",
      foreignKey: "id_user",
    });
  };

  return User;
};
