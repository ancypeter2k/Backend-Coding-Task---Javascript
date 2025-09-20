import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Part extends Model {}

Part.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("RAW", "ASSEMBLED"), allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    parts: { type: DataTypes.JSONB, allowNull: true },
  },
  { sequelize, modelName: "Part", timestamps: true },
);

Part.beforeCreate(async (part) => {
  if (!part.id) {
    part.id = part.name.toLowerCase().replace(/\s/g, "-") + "-" + Date.now();
  }
});

export default Part;
