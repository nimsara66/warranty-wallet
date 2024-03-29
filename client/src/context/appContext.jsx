import React, { useReducer, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import moment from 'moment'

import reducer from './reducer'


const user = localStorage.getItem('user')
const token = localStorage.getItem('token')

const initialState = {
  isLoading: false,
  user: user ? JSON.parse(user) : null,
  token: token,
}

const AppContext = React.createContext()

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)


  // axios
  const axiosFetch = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
  })

  // request
  axiosFetch.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${state.token}`
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // response
  axiosFetch.interceptors.response.use(
    (response) => {
    return response
  }, (error) => {
    // console.log(error.response)
    if (error.response.status === 401) {
      logoutUser()
    }
    return Promise.reject(error)
  })

  // ----------------login-------------

  // const displayAlert = () => {
  //   dispatch({ type: 'SHOW_ALERT' })
  //   clearAlert()
  // }

  // const clearAlert = () => {
  //   setTimeout(() => {
  //     dispatch({ type: 'CLEAR_ALERT' })
  //   }, 3000)
  // }

  const addUserToLocalStorage = ({ user, token }) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
  }

  const removeUserToLocalStorage = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms))
  }

  const login = async (currentUser) => {
    // console.log('a');
    // console.log('waiting...')
    // let delayres = await delay(5000);
    // console.log('b');

    console.log('login user function')

    dispatch({
      type: 'LOGIN_USER_BEGIN',
    })

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`,
        currentUser
      )

      console.log(data)

      const { user, token } = data
      dispatch({
        type: 'LOGIN_USER_SUCCESS',
        payload: {
          user,
          token,
        },
      })
      toast.success('LOGIN SUCCESS')
      // local storage
      addUserToLocalStorage({
        user,
        token,
      })



    } catch (error) {
      console.log(error.response.data.msg)
      toast.error(error.response.data.msg)
      dispatch({
        type: 'LOGIN_USER_ERROR',
      })
    }

    // clearAlert()
  }

  const register = async (registerData) => {
    // console.log('a');
    // console.log('waiting...')
    // let delayres = await delay(5000);
    // console.log('b');

    console.log('register user function')

    dispatch({
      type: 'LOGIN_USER_BEGIN',
    })

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/register`,
        registerData
      )

      console.log(data)

      const { user, token } = data
      dispatch({
        type: 'LOGIN_USER_SUCCESS',
        payload: {
          user,
          token,
        },
      })
      toast.success('LOGIN SUCCESS')
      // local storage
      addUserToLocalStorage({
        user,
        token,
      })
    } catch (error) {
      console.log(error.response.data.msg)
      toast.error(error.response.data.msg)
      dispatch({
        type: 'LOGIN_USER_ERROR',
      })
    }

    // clearAlert()
  }

  const logoutUser = () => {
    dispatch({ type: 'LOGOUT_USER' })
    removeUserToLocalStorage()
  }

  const addWarrantyStatus = (warranties) => {
    warranties.forEach((warranty) => {
      const expirationDate = moment(warranty.purchaseDate).add(warranty.itemId.productId.warrentyPeriod, 'months').toDate();
      const currentDate = new Date();

      if (expirationDate < currentDate) {
        warranty.state = 'EXPIRED'
      } else if (!warranty.customerId) {
        warranty.state = 'INACTIVE'
      } else {
        warranty.state = 'ACTIVE'
      }

      console.log(warranty)
    })
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logoutUser,
        axiosFetch,
        addWarrantyStatus
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => {
  return useContext(AppContext)
}

export { AppProvider, initialState, useAppContext }
