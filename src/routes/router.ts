import {createBrowserRouter} from "react-router-dom";
import App from "../pages/App";
import Uno from "../pages/Uno";

const router = createBrowserRouter([
    {
        path:'/',
        Component:App
    }
])


export default router;