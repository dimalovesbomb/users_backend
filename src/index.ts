import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { getUsers, addUser, removeUser, changeData, uploadPic } from './dbMethods';
import path from 'path';
import  jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { UserModel } from './models/User';

const app = express();
const PORT = 3000;

// DATABASE CONNECTION //

mongoose.connect(
  'mongodb+srv://dima_loves_bomb:8903Dmit@dimalovesbomb.mfzkb.mongodb.net/users?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.on('error', console.log.bind(console, 'Database connection error'));
mongoose.connection.once('open', () => {
  console.log('Connected to database');
});
mongoose.set('useFindAndModify', false); // Anti-deprecation warning

// STORAGE MIDDLEWARE SETTINGS //

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

// REQUEST HEADERS SETTINGS //

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());

// AUTHORIZATION HANDLERS //

function checkToken(req, res, cb) {
  const token = req.header('Auth-Token');
  if (!token) {
    return res.status(401)
      .send({ statusCode: 401, status: 'Access denied: Auth-Token is not provided' });
  }
  try {
    const verified = jsonwebtoken.verify(token, 'hsdjfhskjdh');
    req.user = verified;
    console.log(req.user); // Is needed for further personalisation
    return cb(null, true);
  } catch (error) {
    return res.status(400).send({ statusCode: 400, status: 'Access denied: Auth-Token is invalid' });
  }
}

async function authorizer(req, res, cb) {
  const { login, password } = req.body;
  
  const user = await UserModel.findOne({login});
  if (!user) return res.status(401).send({ statusCode: 401, status: 'This user was not found' });

  const validPassword: boolean = await bcryptjs.compare(password, user.password);
  if (!validPassword) return res.status(401).send({ statusCode: 401, status: 'Invalid login/password' });

  return cb(null, true);
}

// ROUTES //

app.post('/login', authorizer, async (req, res) => {
  const user = await UserModel.findOne({login: req.body.login});
  const token = jsonwebtoken.sign({_id: user._id}, 'hsdjfhskjdh');

  return res.header('Auth-Token', token)
    .status(200)
    .send({ statusCode: 200, status: `Logged in! Use 'Auth-Token' for futher requests` });
})

app.get('/users', checkToken, async (req, res) => {
    const operationResult = await getUsers();
  
    return res.status(operationResult.statusCode).send(operationResult)
  });
  
app.post('/users', async (req, res) => {
  const operationResult = await addUser(req.body);

  return res.status(operationResult.statusCode).send(operationResult)
});
  
app.post('/upload?:id', checkToken, upload.single('avatar'), async (req, res) => {
    const { path } = req.file;
    const { id } = req.query;
    const operationResult = await uploadPic(id, path);
  
    return res.status(operationResult.statusCode).send(operationResult)
  });
  
app.get('/uploads/:filename', (req, res) => {
    const pathToFile = `${__dirname}/..${req.path}`;
  
    return res.status(200).sendFile(path.resolve(pathToFile), {dotfiles: 'allow'});
  });
  
app.put('/users?:id', checkToken, async (req: any, res) => {
    const ID: any = req.query.id; //actually 'ID: string', but TS is a donkey
    const BODY = req.body;
    const CLIENT_ID = req.user._id;
    
    const operationResult = await changeData(ID, BODY, CLIENT_ID);
    
    return res.status(operationResult.statusCode).send(operationResult);
  });
  
app.delete('/users?:id', checkToken, async (req, res) => {
    const ID: any = req.query.id;
    const operationResult = await removeUser(ID);
  
    return res.status(operationResult.statusCode).send(operationResult);
  });

// SERVER CONNECTION LISTENER //

app.listen(PORT, () => {
  console.log(`⚡️ server is running on port ${PORT}`);
});
