import React from 'react'
import { Outlet } from 'react-router-dom'
const App = () => {
  return (
    <div>
      <h1>Navbar</h1>
      <h1>sidebar</h1>
      <Outlet />
    </div>
  )
}

export default App