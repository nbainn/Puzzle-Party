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
    default: false,
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

    await sequelize.sync()
      .then(() => {
        console.log('Models synchronized successfully.');
      })
      .catch((err) => {
        console.error('Error synchronizing models:', err);
    });

    console.log(Character === sequelize.models.Character);
    const character = Character.build({ id: 0, index: 0, value: "a", 
      isParent: true});
    console.log(character.id)
    console.log(Description === sequelize.models.Description);
    const description  = Description.build({id: 1920, description: "Sample Description"})

    const character2 = Character.build({ id: 1, index: 1, value: "a", 
      parent_id: character.id, description_id: description.id});

    console.log(character2.description_id)

    // save is asynchronous, meaning you have to wait
    // build only creates the instance, doesn't actually save it to the database
    await character.save();
    await character2.save();
    await description.save();

    // can also use create to do build + save in one go

    const character3 = await Character.create({ id : 2, index:( character2.id + 1), value: "r",
      parent_id: character2.id})
    console.log(character3.value)
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
 

testDbConnection();
module.exports = { sq: sequelize, testDbConnection };
