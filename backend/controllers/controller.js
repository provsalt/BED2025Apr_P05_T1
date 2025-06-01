import {createUserController, getUserController} from "./user/userController.js";

/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
    app.get("/api/users/:id", getUserController)
    app.post("/api/users", createUserController)
}