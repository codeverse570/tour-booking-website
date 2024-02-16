import axios from "axios"
import {showAlert} from "./alert"
export const addReview= async(review)=>{
    try {
        
        const res = await axios({
            method: "Post",
            url: "/api/review",
            data: review
        })
        if (res.data.message === "success") {
            showAlert(res.data.message, "Review Posted")

            setTimeout(()=>{window.location.reload()},2000)
            
        }
    }
    catch (err) {
        console.log(err)
        showAlert("error", err.response.data.message)
    }
}
export const editReview= async(review)=>{
    try {
        
        const res = await axios({
            method: "PATCH",
            url: `/api/review/${review.tour}`,
            data: review
        })
        if (res.data.message === "success") {
            showAlert(res.data.message, "Review Updated")
            
        }
    }
    catch (err) {
        console.log(err)
        showAlert("error", err.response.data.message)
    }
}