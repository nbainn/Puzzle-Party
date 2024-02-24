const { Sequelize, DataTypes, Model } = require('sequelize');

// Option 1: Passing a connection URI
const sequelize = new Sequelize('postgres://postgres:10018219@localhost:5432/PuzzleParty') // Example for postgres

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
 

testDbConnection();

class Character extends Model 
{
  index;
  value;
  isParent;
  parent_id;
  description_id;
  

}

class Description extends Model {}

Character.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
/*   // index in word: ex: "abc" - a would have index 0
  index: {
    type:DataTypes.INTEGER,
    allowNull: false
  },
  // single char store
  value: {
    type : DataTypes.STRING,
    allowNull: false
  },
  isParent: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  // foreign key
  parent_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Character,
      key: 'id'
    }
  },
  description_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Description,
      key: "id"
    }
  } */
}, 
{
  sequelize,
  modelName: "Character"
})
console.log(Character === sequelize.models.Character);

Description.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // foreign key to a character
  char_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Character,
      key: 'id'
    }
  }, 
}, {
  sequelize,
  modelName: "Description"
})
module.exports = { sq: sequelize, testDbConnection };
