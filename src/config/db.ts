import mongoose from 'mongoose'

export const mongooseConfig = ()=>{
    mongoose.connect('mongodb+srv://Sahal:Sa%40115894@cluster0.x1gvuc8.mongodb.net/calender-task').then(()=>{
        console.log('Connected to MongoDB')
    }).catch(err => console.log(err));
    
}
