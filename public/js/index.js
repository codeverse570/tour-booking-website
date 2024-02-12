import { logIn, logout } from "./login"
import { mapFun } from "./mapbox"
import {bookTour} from "./stripe"
import { updateUser, updatePassword } from "./updateUser"
import "@babel/polyfill"
let form = document.querySelector("#form")
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        console.log(email, password)
        logIn(email, password)
    })
}
const map = document.getElementById("map")
if (map) {
    let locations = document.getElementById("map").dataset.locations
    locations = JSON.parse(locations)
    mapFun(locations)
}
const lgnoutbtn = document.querySelector(".nav__el--logout")
if (lgnoutbtn) {
    lgnoutbtn.addEventListener("click", () => {
        logout();
    })
}
const updateForm = document.getElementById("updateform")
if (updateForm) {
    updateForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const form = new FormData()
        let email = document.getElementById("email").value
        let name = document.getElementById("name").value
        let photo = document.getElementById("photo").files[0]
        form.append("email", email)
        form.append("name", name)
        form.append("photo", photo)
        updateUser(form)
    })
}
const passwordForm = document.getElementById('password-form')
if (passwordForm) {
    // console.log("hello")
    passwordForm.addEventListener("submit", (e) => {
        console.log('hello')
        e.preventDefault()

        const currentPassword = document.getElementById("password-current")
        const Password = document.getElementById("password")
        const confirmPassword = document.getElementById("password-confirm")
        updatePassword(currentPassword, Password, confirmPassword)
    })
}
const bookBtn= document.getElementById("booktour");
if(bookBtn){
     bookBtn.addEventListener("click",async(e)=>{
           e.target.innerText="Processing..."
           await bookTour(e.target.dataset.tourId)
           e.target.innerText="Book Tour Now!"
     })
}
