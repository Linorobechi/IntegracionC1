const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solicitudes_academicas';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB conectado correctamente');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✓ MongoDB desconectado');
  } catch (error) {
    console.error('✗ Error desconectando MongoDB:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
