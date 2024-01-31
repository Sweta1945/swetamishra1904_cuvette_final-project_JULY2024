const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        console.log(process.env.MONGODB_URL);
        const c = await mongoose.connect(process.env.MONGODB_URL,{
            dbName : 'quiz'
        });        
        console.log(`database connected with database named- ${c.connection.name}`)
    } catch (error) {
        console.log(error.message)
        console.log('database not connected')
    }
}

module.exports = connectDB