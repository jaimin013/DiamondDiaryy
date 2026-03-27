// import express from 'express';


// const app = express();
// // const Port = 3000
// app.get(('/', (req, res) => {
// res.send('<h1>serve is running</h1>')
// }))
// app.listen(3000, () => {
//  console.log( "app is listening in the port 3000 http://localhost:3000")
// })
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Server is running</h1>');
});

app.listen(3000, () => {
  console.log("App is listening on port 3000: http://localhost:3000");
});
