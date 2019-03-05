var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var BookSchema=mongoose.Schema({
    author:{
     type:String,
    },
    book_author:{
    	type:String,
    	require:true
    },
    book_name:{
       type:String,
       require:true
    },
    bookURL:{
        type:String,
    },
    book_price:{
        type:String,
    	require:true
    },
    book_description:{
        type:String,
    	require:true
    },
    rate:{
        type:Number
    },
    posted_date:{
        type:Date,
        require:true
    },
    updated_date:{
        type:Date,
        require:true
    },
    rate:{type:mongoose.Schema.Types.ObjectId,ref:'Rating', require:true}
});

module.exports=mongoose.model('Book',BookSchema);