import express from 'express';
import multer from 'multer';
import { getUsers, addUser, removeUser, changeData, attachProfilePicUrl } from './dbMethods';

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) =>  {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})

const upload = multer({storage});

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());

app.get('/users', (req, res) => {
  /*
  No params/query needed
  */
  const operationResult = getUsers();

  return res.status(operationResult.statusCode).send(operationResult)
});

app.post('/users', (req, res) => {
  /*
  In $req:
    $req.body must have an User object
  */
  const operationResult = addUser(req.body);

  return res.status(operationResult.statusCode).send(operationResult)
});

app.post('/upload?:id', upload.single('avatar'), (req, res) => {
  const { path } = req.file;
  const { id } = req.query;
  const operationResult = attachProfilePicUrl(id, path);

  return res.status(operationResult.statusCode).send(operationResult)
});

app.put('/users/:id', (req, res) => {
  /*
  In $req:
    $req.params must have an $id;
    $req.body must have an User object
  */
  const ID: any = req.params.id; //actually 'ID: string', but TS is a donkey
  const BODY = req.body;
  const operationResult = changeData(ID, BODY);

  return res.status(operationResult.statusCode).send(operationResult);
});

app.delete('/users/:id', (req, res) => {
  /*
  In $req:
    $req.params.id must have an User.id
  */
  const operationResult = removeUser(req.params.id);

  return res.status(operationResult.statusCode).send(operationResult);
});

app.listen(PORT, () => {
  console.log(`⚡️ server is running on port ${PORT}`);
});
