const { Sequelize, DataTypes, Model } = require('sequelize');

// Option 1: Passing a connection URI
const sequelize = new Sequelize('postgres://postgres:10018219@localhost:5432/PuzzleParty') // Example for postgres


class Character extends Model 
{
  /* index;
  value;
  isParent;
  parent_id;
  description_id; */

}

class Description extends Model {
  /* char_id; */
}

Description.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING
  }, 
  // foreign key to a character
  /*
  char_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Character,
      key: 'id'
    }
  }, */
}, {
  sequelize,
  modelName: "Description"
})


Character.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // index in word: ex: "abc" - a would have index 0
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
  } 
}, 
{
  sequelize,
  modelName: "Character"
})


const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    console.log(Character === sequelize.models.Character);
    const character = Character.build({ id: 0, index: 0, value: "a", 
      isParent: true});
    console.log(character.id)
    console.log(Description === sequelize.models.Description);

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
 

testDbConnection();
module.exports = { sq: sequelize, testDbConnection };
