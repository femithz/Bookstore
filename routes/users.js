const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport=require('passport');
const cloudinary = require('cloudinary');
var multer = require('multer');
var Book = require('../models/book');
var Rating =require('../models/rating')
// Section that Handles image
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_ID,
  api_secret:process.env.API_SECRET
})

// Router for User Registration
router.get('/', function(req, res, next) {
  res.send('Welcome to My Book Store for GetDev Auth');
});
router.post('/signup', function(req, res, next) {
   addToDB(req,res); 
});
async function addToDB(req,res){
  const user= new User({
    email:req.body.email,
    username:req.body.username,
    phonenumber:req.body.phonenumber,
    password:User.hashPassword(req.body.password),
    reg_dt:Date.now()
  });
  try{
    doc = await user.save();
    console.log(doc);
    return res.status(201).json(doc);
  } 
  catch(err) {
    return res.status(501).json(err);
  }
}
// Section to login
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.status(501).json(err); }
    if (!user) { return res.status(501).json(info); }
    req.logIn(user, function(err) {
      if (err) { 
        return res.status(501).json(err);
       }
       else {
        return res.status(200).json({
          message:'You have Successfully Login'
        });
       }
    });
  })(req, res, next);
});
// Section to add Book
const storage = multer.diskStorage({
  filename:function (req,file,cb) {
     var datetimestamp = Date.now();
     cb(null, file.fieldname + '-' + Date.now());
     filepath = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
    cb(null, filepath);
  } 
 });
const fileFilter=(req,file,cb)=> {
//reject a file
if (file.mimetype==='image/jpeg' || 'image/png' ) { 
  cb(null,true);
}else{
  cb(null,false);
 }    
} 
const upload=multer({
 storage:storage,
 limits:{fileSize :1024*1024*5},
  fileFilter:fileFilter
});
router.post('/upload', upload.single('bookimage'),isValidUser,  function (req,res)  { 
  cloudinary.v2.uploader.upload(req.file.path, function(err, result){
     if(err){
      return res.status(501).json(err);
     } else {
       req.body.bookimage= result.secure_url;
       var newBook = new Book ({
         bookURL:req.body.bookimage,
         book_author:req.body.book_author,
         book_name:req.body.book_name,
         book_price:req.body.book_price,
         book_description:req.body.book_description,
         author:req.user.username,
         posted_date:Date.now(),
       });
       newBook.save(function (err, book) {
         if (err) {
           console.log(err)
           return res.status(500).json();
         } else {
           console.log(book);
           return res.status(200).json();
         }
       })
     }
});
});
// Section to get all books guest section 
router.get('/books', function(req,res,book){
  Book
  .find()
  .select('_id book_author author  book_name book_price bookURL book_description ')
  .exec()
  .then(docs => {
      res.status(200).json(docs); 
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json({
       error:err
    });
  });
})
// Section To Get all Books
router.get('/books',isValidUser, function(req,res,book){
    Book
    .find()
    .select('_id book_author author  book_name book_price bookURL book_description ')
    .exec()
    .then(docs => {
        res.status(200).json(docs); 
    })
    .catch(err =>{
      console.log(err);
      res.status(500).json({
         error:err
      });
    });
})
// Section to get book by Id
router.get('/book/:bookId',isValidUser, (req,res,next) => {
  const id=req.params.bookId;
  Book.findById(id)
  .select('_id book_author book_name book_price bookURL book_description')
  .exec()
  .then(doc=>{
     if(doc){
      res.status(200).json({
        book:doc
      });
     }else{
      res.status(200).json({
        message:'Invalid Id Number'
      });
     }
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
          error:err
       });
    });
   });
  //  Section to update book
  router.patch('/book/:bookId',isValidUser, (req,res,next) => {
    const id=req.params.bookId;
    const updateOps={};
    for(const ops of req.body){
      updateOps[ops.propName]=ops.value;
   }
  //  for (const [key, value] of Object.entries(updateOps)) {
  //   console.log(key, value);
  //   updateOps[key.propName]=key.value;
  // }
    Book.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
      console.log(result);
      res.status(200).json({
        message:'book updated',
        request:{
          type:'GET'
        }
      });
    })
    .catch(err=>{
      res.status(200).json({
        error:err
      });
    });
  });
  // Section to delete book
  router.delete('/book/:bookId',isValidUser, (req,res,next) => {
  Book.remove({ _id:req.params.bookId})
  .exec()
  .then(result=>{
    console.log(result);
      res.status(200).json({
          message:"book deleted",
          request:{
              type:"POST"
          }
      });
  })
  .catch(err=>{
      res.status().json({
          error:err
      });
  });
});
// Rating section to get all ratings
router.get('/ratings', (req,res,next)=>{
  Rating.find()
  .select("book_name book_author _id")
  .populate('book_name','book_author')
  .exec()
  .then(docs=>{
      res.status(200).json({
        count:docs.length,
        rating:docs.map(doc=>{
          return{ 
          rate_id:doc.id,
          book_name:doc.book_name,
          book_author:doc.book_author, 
    request:{
         type:"GET",
         url:'http://localhost/users/ratings/' + doc.id 
    }
         }
      })
     })
  })
   .catch(err=>{
   res.status(500).json({
   error:err
});
});
});
// Section to rate book
router.post('/rate',isValidUser,(req,res,next) => {
  Book.findById(req.body.bookId)
  .then(book=>{
    if (!book) {
      return res.status(404).json({
          message:'Book not found',
      })
    }  else {
      const rate=new Rating({
        rate:req.body.rate,
        book:req.body.bookId,
    });
     return rate.save();
    }
})
 .then(result=>{
   res.status(201).json({
       message:'You have rate the book',
     });
 })
 .catch(err=>{
   console.log(err);
   res.status(500).json({
     error:err
   });
  });
 });
// Section to check validity of User
function isValidUser(req,res,next) {
  if (req.isAuthenticated()) next();
  else return res.status(401).json({message:'Unauthorized Request'}); 
}
// logout section
router.get('/logout',isValidUser, function(req, res, next) {
  req.logout();
   return res.status(200).json({message:'logout success'});
});
module.exports = router;
