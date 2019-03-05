var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var RatingSchema=mongoose.Schema({
    book:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    rate_id:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    book_author:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    book_name:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    bookURL:{type:mongsoose.Schema.Types.ObjectId,ref:'Book', require:true},
    book_price:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    book_description:{type:mongoose.Schema.Types.ObjectId,ref:'Book', require:true},
    rate:{type:Number}
});

module.exports=mongoose.model('Rating',RatingSchema);