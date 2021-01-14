import express from 'express';
import multer from 'multer';
import basicAuth, { BasicAuthMiddlewareOptions, IUsersOptions } from 'express-basic-auth';
import { getUsers, addUser, removeUser, changeData, uploadPic } from './dbMethods';
import { getLoginCreds, getBasicAuthOptions } from './database/loginCreds';

const app = express();
const PORT = 3000;


const storage = multer.diskStorage({
  destination: (req, file, cb) =>  {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      const [type ,fileExtention] = file.mimetype.split('/');

      cb(null, `${Date.now()}.${fileExtention}`);
    } else {
      return cb( new Error('Only .jpg and .jpeg format allowed!'), file.originalname );
    }
  }
});

const upload = multer({storage});

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const options: BasicAuthMiddlewareOptions = getBasicAuthOptions(getLoginCreds());
app.use(basicAuth(options));
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
  const operationResult = uploadPic(id, path);

  return res.status(operationResult.statusCode).send(operationResult)
});

app.put('/users?:id', (req, res) => {
  /*
  In $req:
    $req.params must have an $id;
    $req.body must have an User object
  */
  const ID: any = req.query.id; //actually 'ID: string', but TS is a donkey
  const BODY = req.body;
  const operationResult = changeData(ID, BODY);

  return res.status(operationResult.statusCode).send(operationResult);
});

app.delete('/users?:id', (req, res) => {
  /*
  In $req:
    $req.query.id must have an User.id
  */
  const ID: any = req.query.id;
  const operationResult = removeUser(ID);

  return res.status(operationResult.statusCode).send(operationResult);
});

app.listen(PORT, () => {
  console.log(`⚡️ server is running on port ${PORT}`);
});
