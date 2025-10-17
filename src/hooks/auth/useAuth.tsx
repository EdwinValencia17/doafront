import React from 'react'
import {login} from '../../services/auth.service'
const useAuth = () => {
  async function iniciarSesion(email: string, password: string) {
    try {
       const response = await login(email, password);
       if(response.status == 200){
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return 'OK';
       }
       else{
        return 'ERROR';
       }
    }
    catch (error:any) {}
}

  return {iniciarSesion}
}
export default useAuth