import type { NextPage } from 'next'
import Image from 'next/image'
import { useState, useEffect, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from "react-hook-form";
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import { Auth } from '@aws-amplify/auth';
import axios from 'axios'
import { Error } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
}));

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  timeout: 1000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-type': 'application/json',
  }
});

interface Error {
  nickname: string
  age: string
}

const Home: NextPage = () => {
  const classes = useStyles();
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [profile, setProfile] = useState({});
  const [formProfileNickname, setFormProfileNickname] = useState("");
  const [formProfileAge, setFormProfileAge] = useState(0);
  const [validationErrors, setValidationErrors] = useState({nickname: "", age: ""});
  const [errors, setErrors] = useState([]);
  const [message, setMassage] = useState("");

  useEffect(() => {
    currentSession()
    currentAuthenticatedUser()
  }, []);

  const listAnnouncements = async () => {
    let res
    try {
      res = await axiosInstance.get('announcements')
    } catch (err) {
      setValidationErrors(err.response.data.errors)
      return
    }
    setAnnouncements(res.data)
  }

  const getProfile = async () => {
    let res
    try {
      res = await axiosInstance.get('profile')
    } catch (err) {
      handleError(err)
      return
    }
    setProfile(res.data)
    setFormProfileNickname(res.data.nickname)
    setFormProfileAge(res.data.age)
  }

  const putProfile = async () => {
    let res
    try {
      res = await axiosInstance.put('profile', {
        nickname: formProfileNickname,
        age: formProfileAge,
      })
    } catch (err) {
      handleError(err)
      return
    }
    setValidationErrors({nickname: "", age: ""})
  }
  
  const handleError = (err) => {
    if (!err.response.data.type) {
      return
    }

    if (err.response.data.type == "validation") {
      setValidationErrors(err.response.data.error)
    } else if (err.response.data.type == "message") {
      setErrors([err.response.data.error])
    }
  }
  
  const handleCloseMessage = () => {
    setMassage("")
  }

  const handleClose = () => {
    setErrors([])
  }

  const login = () => {
    window.location.href = "https://user-pool-domain/oauth2/idpresponse"
    // Auth.federatedSignIn();
  }

  const logout = () => {
    Auth.signOut();
  }

  const currentAuthenticatedUser = async () => {
    const authenticatedUser = await Auth.currentAuthenticatedUser()
    console.log(authenticatedUser)
    setUser(authenticatedUser)
  }

  const currentSession = async () => {
    const session = await Auth.currentSession()
    console.log(session)
    setSession(session)
  }
 
  return (
    <div className="container mx-auto">
      <AppBar>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            simple community
          </Typography>
            {user === null ? 
             <Button color="inherit" onClick={login}>Login</Button> :
             <Button color="inherit" onClick={logout}>Logout</Button>
            }
        </Toolbar>
      </AppBar>
      
      <Snackbar open={errors && errors.length > 0} autoHideDuration={10000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errors.map(error => <div key={error}>{error}</div>)}
        </Alert>
      </Snackbar>

      <Snackbar open={message.length > 0} autoHideDuration={10000} onClose={handleCloseMessage}>
        <Alert onClose={handleCloseMessage} severity="error">
          {message}
        </Alert>
      </Snackbar>

      <main>
        <div className={classes.appBarSpacer} /> 

        <Box m={3}>
          <Button variant="contained" color="primary" onClick={listAnnouncements}>お知らせ一覧再取得(認証不要)</Button>
          { (announcements && announcements.length > 0) ? 
            <ul>
              {announcements.map(announcement => (
                <li key={announcement.ID}>{JSON.stringify(announcement)}</li>
              ))}
            </ul> : 
            <div>お知らせはありません</div>
          } 
        </Box>

        <Box m={3}>
          <Button variant="contained" color="primary" onClick={putProfile}>プロフィール登録(認証必要)</Button>
          <form noValidate autoComplete="off">
            <div>
              <TextField 
                id="profile-nickname" 
                value={formProfileNickname} 
                label="Nickname" 
                error={validationErrors.nickname && validationErrors.nickname != ""} 
                helperText={validationErrors.nickname || null}
                onChange={(e) => { setFormProfileNickname(e.target.value) }} 
              />
            </div>
            <div>
              <TextField 
                id="profile-age" 
                value={formProfileAge} 
                label="Age" 
                error={validationErrors.age && validationErrors.age != ""} 
                helperText={validationErrors.age || null}
                onChange={(e) => { 
                  const numVal = Number(e.target.value)
                  if (!isNaN(numVal)) {
                    setFormProfileAge(numVal) 
                  }
                }} 
              />
            </div>
          </form>
        </Box>

        <Box m={3}>
          <Button variant="contained" color="primary" onClick={getProfile}>プロフィール取得(認証必要)</Button>
          <div>{JSON.stringify(profile)}</div>
        </Box>


        <Box m={3}>
          <Button variant="contained" color="primary" onClick={currentSession}>currentSession</Button>
          <div>{JSON.stringify(session)}</div>
        </Box>

        <Box m={3}>
          <Button variant="contained" color="primary" onClick={currentAuthenticatedUser}>currentAuthenticatedUser</Button>
          <div>{JSON.stringify(user)}</div>
        </Box>

      </main>
    </div>
  )
}

export default Home
