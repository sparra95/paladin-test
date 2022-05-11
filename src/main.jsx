import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ContractContextProvider } from "./context/ContractContext"

ReactDOM.createRoot(document.getElementById('root')).render(
    <ContractContextProvider>
      <App />
    </ContractContextProvider>
)