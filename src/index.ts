import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { getUsers, addUser, removeUser, changeData, uploadPic } from './dbMethods';
import path from 'path';
import basicAuth, { BasicAuthMiddlewareOptions } from 'express-basic-auth';
import { getBasicAuthOptions } from './database/loginCreds';
import { UserModel } from './models/User';

const app = express();
const PORT = 3000;

mongoose.connect(
  'mongodb+srv://dima_loves_bomb:8903Dmit@dimalovesbomb.mfzkb.mongodb.net/users?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true },
  // () => console.log('db connected')
);
mongoose.connection.on('error', console.log.bind(console, 'connection error'));
mongoose.connection.once('open', () => {
  console.log('Connected to database');
});

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

export const upload = multer({storage});

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());


export const authRequired = basicAuth({
  authorizer,
  authorizeAsync: true
});

async function authorizer(login, password, cb) {
  const users = await UserModel.find();
  const options: any = getBasicAuthOptions(users);
  const dbLogin = Object.keys(options.users).find( log => login === log);
  const dbPassword = Object.values(options.users).find( pass => password === pass);

  if (login.startsWith(dbLogin) & password.startsWith(dbPassword)) {
    return cb(null, true);
  } else {
    return cb(null, false);
  }
}

app.get('/users', authRequired, async (req, res) => {
  // No params/query needed
    const operationResult = await getUsers();
  
    return res.status(operationResult.statusCode).send(operationResult)
  });
  
  app.post('/users', async (req, res) => {
  //   In $req: $req.body must have an User object
    const operationResult = await addUser(req.body);
  
    return res.status(operationResult.statusCode).send(operationResult)
  });
  
  app.post('/upload?:id', authRequired, upload.single('avatar'), async (req, res) => {
    const { path } = req.file;
    const { id } = req.query;
    const operationResult = await uploadPic(id, path);
  
    return res.status(operationResult.statusCode).send(operationResult)
  });
  
  app.get('/uploads/:filename', (req, res) => {
    const pathToFile = `${__dirname}/..${req.path}`;
  
    return res.status(200).sendFile(path.resolve(pathToFile), {dotfiles: 'allow'});
  });
  
  app.put('/users?:id', async (req, res) => {
    /*
    In $req:
      $req.params must have an $id;
      $req.body must have an User object
    */
    const ID: any = req.query.id; //actually 'ID: string', but TS is a donkey
    const BODY = req.body;
    
    const operationResult = await changeData(ID, BODY);
    console.log(operationResult);
    
  
    return res.status(operationResult.statusCode).send(operationResult);
  });
  
  app.delete('/users?:id', async (req, res) => {
    /*
    In $req:
      $req.query.id must have an User.id
    */
    const ID: any = req.query.id;
    const operationResult = await removeUser(ID);
  
    return res.status(operationResult.statusCode).send(operationResult);
  });

app.listen(PORT, () => {
  console.log(`⚡️ server is running on port ${PORT}`);
});
