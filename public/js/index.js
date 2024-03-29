import { logIn, logout, signUp } from "./login"
import { mapFun } from "./mapbox"
import { bookTour } from "./stripe"
import { updateUser, updatePassword, forgetPassword,resetPassword} from "./updateUser"
import { showAlert } from "./alert"
import {editReview,addReview} from "./review"
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

const reviewForm= document.getElementById("review-form")

if(reviewForm){
const stars = document.querySelectorAll('.review--star');
const ratingStar = document.getElementById('ratingStar');
const reviewButton =document.getElementById('review-button')
const reviewContent=document.getElementById("review-content")
console.log(ratingStar.value)
console.log(stars)
stars.forEach(function (star, index) {
  star.addEventListener('click', function () {
    const rating = index + 1;
    ratingStar.value = rating;
    highlightStars(stars,rating);
  });
});
reviewForm.addEventListener("submit",async (e)=>{
    e.preventDefault()  
    const rating= ratingStar.value||3
    const review= reviewContent.textContent
    const tour= reviewForm.dataset.tour
    if(e.submitter.classList[0]=='review-submit')
    await addReview({rating,review,tour})
    else await editReview({rating,review,tour})
    ratingStar.value=0
})

}
function highlightStars(stars,rating) {
  stars.forEach(function (star, index) {
    if (index < rating) {
      star.classList.add('reviews__star--active');
      star.classList.remove('reviews__star--inactive');
    } else {
      star.classList.remove('reviews__star--active');
      star.classList.add('reviews__star--inactive');
    }
  });
}
const forgetPassForm =document.getElementById("forgetPassForm")
// console.log(forgetPassForm)
if(forgetPassForm){
    // console.log('hello')
     let email = document.getElementById("email")
     forgetPassForm.addEventListener("submit", async(e)=>{
        e.preventDefault()
        email=email.value
        
        await forgetPassword(email)
     })
}
const resetPasswordForm =document.getElementById("resetPasswordForm")
if(resetPasswordForm){
  resetPasswordForm.addEventListener("submit",async(e)=>{
       e.preventDefault()
       const password= document.getElementById("password").value
       const passwordConfirm= document.getElementById("confirmPassword").value
       const token= e.target.dataset.token
    //    console.log(password,passwordConfirm)
       await resetPassword({password,passwordConfirm},token)
    })
}
// SIDEBAR TOGGLE
const barChartDiv= document.getElementById("bar-chart")

let sidebarOpen = false;
const sidebar = document.getElementById('sidebar');
if(sidebar){
function openSidebar() {
  if (!sidebarOpen) {
    sidebar.classList.add('sidebar-responsive');
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen) {
    sidebar.classList.remove('sidebar-responsive');
    sidebarOpen = false;
  }
}
}

// ---------- CHARTS ----------

// BAR CHART
if(barChartDiv){
const tourData= JSON.parse(barChartDiv.dataset.topTours)
// console.log(tourData)
let ratingData=[]
let tourName=[]
 tourData.forEach( tour=>{
      ratingData.push(Math.round(tour.ratingAverage*100)/100)
      tourName.push(tour.name)
 })
const barChartOptions = {
  series: [
    { 
      name:"rating",
      data: ratingData,
    },
  ],
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1'],
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      horizontal: false,
      columnWidth: '40%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
  },
  xaxis: {
    categories: tourName,
  },
  yaxis: {
    title: {
      text: 'Avg Rating',
    },
  },
};

const barChart = new ApexCharts(
  document.querySelector('#bar-chart'),
  barChartOptions
);
barChart.render();
}
const areaChartDiv= document.getElementById("area-chart")
// AREA CHART
if(areaChartDiv){
let monthWiseTour;
let monthStats= JSON.parse(areaChartDiv.dataset.tourInMonth)
// console.log(monthStats)
monthWiseTour= monthStats.map(data=> data.count)
const areaChartOptions = {
  series:[
    {
      name: 'Tours',
      data: monthWiseTour,
    }
]
  ,
  chart: {
    height: 350,
    type: 'area',
    toolbar: {
      show: false,
    },
  },
  colors: ['#4f35a1'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'],
  markers: {
    size: 0,
  },
  yaxis: {
      title: {
        text: 'Total Tours',
      },
      min:0,
      max:Math.max(...monthWiseTour)+1,
      tickAmount:Math.max(...monthWiseTour)+1
  }
};
const areaChart = new ApexCharts(
  document.querySelector('#area-chart'),
  areaChartOptions
);
areaChart.render();

}