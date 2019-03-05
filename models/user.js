// Schema for User
var mongoose=require('mongoose');
var Schema=mongoose.Schema
var bcrypt=require('bcryptjs');

var UserSchema=mongoose.Schema({
    user_id:mongoose.Schema.Types.ObjectId,
    username:{
    	type:String,
    	require:true
    },
    email:{
       type:String,
       require:true
    },
    password:{
    	       type:String,
               require:true
    },
    phonenumber:{
        type:Number,
        require:true
    },
    reg_dt:{
        type:Date,
    	require:true
    }
});

UserSchema.statics.hashPassword=function hashPassword(password){
    return bcrypt.hashSync(password,10)
}
UserSchema.methods.isValid=function (hashedpassword) {
    return bcrypt.compareSync(hashedpassword,this.password);
}

module.exports=mongoose.model('User',UserSchema);