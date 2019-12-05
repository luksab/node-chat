var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url,{useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  //Find the first document in the customers collection:
  var myobj = { name: "Companies Inc", address: "Val" };
  dbo.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
  dbo.collection("customers").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
  dbo.collection("customers").findOne({},function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
  var myquery = { address: "Val" };
  var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
  dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
  dbo.collection("customers").deleteMany({name: "Company Inadc"},(err,result)=>{
    if (err) throw err;
    console.log(result);
    db.close();
  });
});
