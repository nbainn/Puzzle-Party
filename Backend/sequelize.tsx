const { Sequelize, DataTypes, Model, Op } = require('sequelize');
const config = require('./config');
const bcrypt = require('bcryptjs');

// Option 1: Passing a connection URI
const sequelize = new Sequelize(config.PostgresPassword) // Example for postgres

// Define the User model with email and hashedPassword fields
class User extends Model {}

User.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  hashedPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#FFFFFF',
    validate: {
      is: /^#(?:[0-9a-fA-F]{3}){1,2}$/i, // Regex to validate hex color codes
    }
  },
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeValidate: (user) => {
      // Set nickname if it's null
      if (!user.nickname) {
        user.nickname = user.email.split('@')[0];
      }
    },
    beforeCreate: async (user) => {
      // Hash the password before saving the User model
      const salt = await bcrypt.genSalt(10); // The salt rounds, the cost of processing the data
      user.hashedPassword = await bcrypt.hash(user.hashedPassword, salt);
    },
  },
});

/*class Character extends Model 
{
  index;
  value;
  isParent;
  parent_id;
  description_id;

}*/

/*class Description extends Model {
  char_id; 
}*/

class Room extends Model {
 
  /*  room_code;
  host;
  num_players;
  isActive;
  public_status;
  */
 
}

class Word extends Model {

  /* word;
  descriptions;
  */

}

class Puzzle extends Model {

/* seed;
puzzle;
*/

}

/*Description.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING
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
})*/


/*Character.init({
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
})*/

Room.init({
  id : {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  room_code : {
    type: DataTypes.STRING,
    allowNull: false
  },
  host : {
    type: DataTypes.STRING,
    allowNull: false
  },
  num_players : {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive : {
    type: DataTypes.BOOLEAN,
    default: true,
    allowNull: false
  },
  public_status : {
    type: DataTypes.BOOLEAN,
    default: true,
    allowNull: false
  },
}, {
  sequelize,
  modelName: "Room"
})

Word.init({
  word : {
    type: DataTypes.STRING,
    allowNull: false
  },
  descriptions : {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: "Word"
});

Puzzle.init({
  seed : {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  puzzle : {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: "Puzzle"
});


/*Character.hasMany(Character, {
  foreignKey: 'parent_id',
  as: 'children'
})*/

/*     console.log(Character === sequelize.models.Character);
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
    console.log(character3.value) */

    // Find all users
    /* const description  = Description.build({id: 1920, description: "Sample Description"})
    const character2 = Character.build({ id: 1, index: 1, value: "a",
      parent_id: 0, description_id: 1920, isParent: false});

    await character2.save();
    await description.save();
   */
/*   const character2 = Character.build({ id: 1, index: 1, value: "a",
      parent_id: 0, description_id: 1920, isParent: false});
  await character2.save();
  const descrips = await Description.findAll();
  console.log(descrips.every(descrip => descrip instanceof Description)); // true
  console.log("All users:", JSON.stringify(descrips, null, 2));


  const users = await Character.findAll();
  console.log(users.every(user => user instanceof Character)); // true
  console.log("All users:", JSON.stringify(users, null, 2));
  */

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } 
};

const syncModels = async () => {
  try {
    await testDbConnection();

    await sequelize.sync()
    .then(() => {
      console.log('Models synchronized successfully.');
    })
    .catch((err) => {
      console.error('Error synchronizing models:', err);
  });

  } catch(error) {
    console.log("Error:", error)
  }
};

/*const fetchWord = async (dictionary) => {
  try {
    await testDbConnection();

    var res
    Object.keys(dictionary).map(async (index) => {
      console.log(index)
      const characters = await Character.findAll({
        where: {
          index: index,
          value: dictionary[index]
        }
    });

    console.log(characters.every(user => user instanceof Character)); // true
    console.log("All users:", JSON.stringify(characters, null, 2));   

    })

  } catch (err) {
    console.log("Error fetching:", err)
  }

}*/

const fetchHost = async (roomCode) => {
  try {
    await testDbConnection();

    const host = await Room.findOne({
      attributes: ['host'],
      where: {
        room_code: roomCode
      }
    });
    if (host) {
      console.log("Host:", host.host);
      return host.host; // Return the host string
    } else {
      console.log("No host found for room code:", roomCode);
      return null; // Return null if no host is found
    }
    //console.log("All users:", JSON.stringify(host, null));

  } catch (err) {
    console.log("Error fetching:", err)
    return null;
  }

}

// createReg creates a regular expression pattern based on the indexes/characters
const createReg = (specs, maxLength) => {
  const sortedEntries = Object.entries(specs).sort(([a], [b]) => +a - +b);
  let pattern = '';
  let prevIndex = 0;
  for (const [index, char] of sortedEntries) {
    const currentIndex = parseInt(index, 10);
    if ((currentIndex - prevIndex) > 1) {
      pattern += `.{${currentIndex - prevIndex - 1}}`;
    }
    pattern += char;
    prevIndex = currentIndex;
  }
  return new RegExp(`^${pattern}.{0,${maxLength - prevIndex}}$`);
};

//fetchWords fetches words from the database based on the indexes/characters
const fetchWords = async (specs, maxLength) => {
  try {
    const pattern = createReg(specs, maxLength);

    const matchingWords = await Word.findAll({
      where: {
        word: {
          [Op.regexp]: pattern.source,
        },
      },
    });
    return matchingWords;
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error;
  }
};
 
testDbConnection();
syncModels();
//fetchWords(dictionary);
//fetchHost("882259");

module.exports = { sq: sequelize, testDbConnection, syncModels, fetchHost, fetchWords, User };