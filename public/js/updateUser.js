import { showAlert } from "./alert"
import { logout } from "./login"
import axios from "axios"
export const updateUser = async (data) => {
    console.log(data)
    try {
        const res = await axios({
            method: "PATCH",
            url: "api/user/updateme",
            data
        })
        const newData = res.data.data
        if (res.data.message === "Success") {
            showAlert('success', "changes saved!")

        }
    }
    catch (err) {
        console.log(err)
        showAlert("error", err.response.data.message)
    }
}
export const updatePassword = async (curP, Pass, cPass) => {
    try {
        const res = await axios({
            method: "PATCH",
            url: "api/user/changepassword",
            data: {
                currentPassword: curP.value,
                password: Pass.value,
                passwordConfirm: cPass.value
            }
        })
        const newData = res.data.data
        if (res.data.message === "success") {
            showAlert('success', "changes saved!")
            setTimeout(() => {
                window.location.assign("/")
                logout()
            }, 4000)

        }
    }
    catch (err) {
        console.log(err)
        showAlert("error", err.response.data.message)
    }
}
