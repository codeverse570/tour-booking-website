import { logIn, logout, signUp } from "./login"
import { mapFun } from "./mapbox"
import { bookTour } from "./stripe"
import { updateUser, updatePassword } from "./updateUser"
import { showAlert } from "./alert"
import "@babel/polyfill"
let form = document.querySelector("#form")
if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value

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

        e.preventDefault()

        const currentPassword = document.getElementById("password-current")
        const Password = document.getElementById("password")
        const confirmPassword = document.getElementById("password-confirm")
        updatePassword(currentPassword, Password, confirmPassword)
    })
}
const bookBtn = document.getElementById("booktour");
if (bookBtn) {
    bookBtn.addEventListener("click", async (e) => {
        e.target.innerText = "Processing..."
        await bookTour(e.target.dataset.tourId)
        e.target.innerText = "Book Tour Now!"
    })
}
const alert = document.querySelector('body').dataset.alert
// console.log(alert)
if (alert === "booking") {
    showAlert("success", "Congrats! Tour is booked")
}
const signUpForm = document.getElementById("signform")
console.log(signUpForm)
if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        console.log("hello")
        const name = document.getElementById("name").value
        const password = document.getElementById("password").value
        const passwordConfirm = document.getElementById("passwordConfirm").value
        const email = document.getElementById("email").value
        await signUp({ name, password, passwordConfirm, email })
    })
}
