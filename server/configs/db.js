import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () =>
            console.log('Database connected')
        );
        await mongoose.connect(`${process.env.MONGODB_URI}/greencart`)
    }
    catch (error) {
        console.error("Error occured while establishing connection: " , error.message);
    }
}

export default connectDB;