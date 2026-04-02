require('dotenv').config();

const app = require('./src/app');
const sequelize = require('./src/config/database');
require('./src/models/prospect.model');
require('./src/models/user.model');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
<<<<<<< Updated upstream
=======
    await sequelize.sync({alter:false});
>>>>>>> Stashed changes

    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutandose en puerto ${PORT}`);
     });

   
   
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
   

  }
};

startServer();
