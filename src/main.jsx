// import React from 'react'
import ReactDOM from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

// cấu hình MUI dialog
import { ConfirmProvider } from 'material-ui-confirm'
import App from '~/App.jsx'
import theme from '~/theme'

// cấu hình react-toastufy
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
// <React.StrictMode>
  <CssVarsProvider theme={theme}>{ /*css mui*/ }
    <ConfirmProvider> { /* thong bao delete*/ }
      <CssBaseline />{ /*css mui*/ }
      <App />
      <ToastContainer theme="colored" position="bottom-right"/>  { /*thong bao loi~*/ }
    </ConfirmProvider>
  </CssVarsProvider>
  // </React.StrictMode> 
)
